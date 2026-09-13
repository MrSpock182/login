import { useEffect, useMemo, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SalesReport } from '@/@types/product';
import { Skeleton } from '@/components/skeleton';
import { formatBRL } from '@/constants/format';
import { elevation, radius, space, ThemeColors } from '@/constants/store-theme';
import { useTheme } from '@/contexts/ThemeContext';
import { getSalesReport } from '@/integration/productsIntegration';

export default function Admin() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [report, setReport] = useState<SalesReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  async function load() {
    setError('');
    setIsLoading(true);
    try {
      setReport(await getSalesReport());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar o relatório.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const maxDayRevenue = report ? Math.max(1, ...report.daily.map((day) => day.revenue)) : 1;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + space.xs }]}>
          <Pressable hitSlop={10} accessibilityLabel="Voltar" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.onHeader} />
          </Pressable>
          <Text style={styles.headerTitle}>Relatório de vendas</Text>
          <Pressable hitSlop={10} accessibilityLabel="Atualizar" onPress={load}>
            <Ionicons name="refresh" size={22} color={colors.onHeader} />
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <View style={styles.kpiGrid}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} height={78} radius={radius.md} style={styles.kpiSkeleton} />
              ))}
            </View>
            <Skeleton height={160} radius={radius.md} />
            <Skeleton height={220} radius={radius.md} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={44} color={colors.textFaint} />
            <Text style={styles.stateText}>{error}</Text>
            <Pressable style={styles.primaryBtn} onPress={load}>
              <Text style={styles.primaryBtnText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : report ? (
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xxl }]}
            showsVerticalScrollIndicator={false}>
            <View style={styles.kpiGrid}>
              <Kpi styles={styles} label="Receita total" value={formatBRL(report.totalRevenue)} highlight />
              <Kpi styles={styles} label="Pedidos" value={String(report.totalOrders)} />
              <Kpi styles={styles} label="Itens vendidos" value={String(report.totalUnits)} />
              <Kpi styles={styles} label="Ticket médio" value={formatBRL(report.averageTicket)} />
            </View>
            <Text style={styles.stockLine}>{report.unitsInStock} unidades ainda em estoque</Text>

            <Text style={styles.sectionTitle}>Vendas por dia</Text>
            <View style={styles.card}>
              {report.daily.map((day) => (
                <View key={day.date} style={styles.dayRow}>
                  <Text style={styles.dayDate}>{day.date.slice(5)}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[styles.barFill, { width: `${(day.revenue / maxDayRevenue) * 100}%` }]}
                    />
                  </View>
                  <Text style={styles.dayValue}>{formatBRL(day.revenue)}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Produtos mais vendidos</Text>
            <View style={styles.card}>
              {report.rows.map((row, index) => (
                <View key={row.productId} style={[styles.itemRow, index > 0 && styles.itemDivider]}>
                  <Text style={styles.rank}>{index + 1}</Text>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {row.name}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {row.unitsSold} vendidas · {row.stock} em estoque
                    </Text>
                  </View>
                  <Text style={styles.itemRevenue}>{formatBRL(row.revenue)}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Estoque baixo</Text>
            <View style={styles.card}>
              {report.lowStock.length === 0 ? (
                <Text style={styles.emptyLine}>Nenhum produto com estoque crítico.</Text>
              ) : (
                report.lowStock.map((row, index) => (
                  <View key={row.productId} style={[styles.itemRow, index > 0 && styles.itemDivider]}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {row.name}
                      </Text>
                      <Text style={styles.itemMeta}>{row.unitsSold} vendidas</Text>
                    </View>
                    <View
                      style={[
                        styles.stockBadge,
                        row.stock === 0 ? styles.stockBadgeOut : styles.stockBadgeLow,
                      ]}>
                      <Text
                        style={[
                          styles.stockBadgeText,
                          { color: row.stock === 0 ? colors.danger : colors.warning },
                        ]}>
                        {row.stock === 0 ? 'esgotado' : `${row.stock} un.`}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            <Text style={styles.generatedAt}>
              Atualizado em {new Date(report.generatedAt).toLocaleString('pt-BR')}
            </Text>
          </ScrollView>
        ) : null}
      </View>
    </>
  );
}

function Kpi({
  styles,
  label,
  value,
  highlight,
}: {
  styles: ReturnType<typeof makeStyles>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.kpi, highlight && styles.kpiHighlight]}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, highlight && styles.kpiValueHighlight]}>{value}</Text>
    </View>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: c.canvas,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space.md,
      paddingHorizontal: space.lg,
      paddingBottom: space.md,
      backgroundColor: c.header,
      ...elevation(c, 2),
    },
    headerTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '700',
      color: c.onHeader,
    },
    loadingWrap: {
      padding: space.lg,
      gap: space.md,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: space.md,
      padding: space.xxl,
    },
    stateText: {
      fontSize: 14,
      color: c.textMuted,
      textAlign: 'center',
    },
    content: {
      padding: space.lg,
      gap: space.sm,
    },
    kpiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: space.md,
    },
    kpiSkeleton: {
      flexGrow: 1,
      flexBasis: '46%',
    },
    kpi: {
      flexGrow: 1,
      flexBasis: '46%',
      backgroundColor: c.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      padding: space.lg,
      gap: 6,
      ...elevation(c, 1),
    },
    kpiHighlight: {
      borderColor: c.accent,
      backgroundColor: c.brandSoft,
    },
    kpiLabel: {
      fontSize: 11,
      color: c.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      fontWeight: '700',
    },
    kpiValue: {
      fontSize: 18,
      fontWeight: '800',
      color: c.textStrong,
      letterSpacing: -0.3,
    },
    kpiValueHighlight: {
      color: c.brand,
    },
    stockLine: {
      fontSize: 12,
      color: c.textMuted,
      paddingLeft: 2,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: c.textStrong,
      marginTop: space.md,
      marginBottom: space.xs,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      padding: space.md,
      ...elevation(c, 1),
    },
    dayRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      paddingVertical: 5,
    },
    dayDate: {
      width: 46,
      fontSize: 12,
      color: c.textMuted,
      fontVariant: ['tabular-nums'],
    },
    barTrack: {
      flex: 1,
      height: 10,
      borderRadius: radius.pill,
      backgroundColor: c.surfaceMuted,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: radius.pill,
      backgroundColor: c.accent,
    },
    dayValue: {
      width: 92,
      textAlign: 'right',
      fontSize: 12,
      fontWeight: '700',
      color: c.text,
      fontVariant: ['tabular-nums'],
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      paddingVertical: space.md,
    },
    itemDivider: {
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    rank: {
      width: 18,
      fontSize: 13,
      fontWeight: '800',
      color: c.textFaint,
      textAlign: 'center',
    },
    itemInfo: {
      flex: 1,
      gap: 2,
    },
    itemName: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textStrong,
    },
    itemMeta: {
      fontSize: 11,
      color: c.textMuted,
    },
    itemRevenue: {
      fontSize: 13,
      fontWeight: '800',
      color: c.price,
    },
    stockBadge: {
      paddingHorizontal: space.sm,
      paddingVertical: 3,
      borderRadius: radius.pill,
    },
    stockBadgeLow: {
      backgroundColor: c.warningSoft,
    },
    stockBadgeOut: {
      backgroundColor: c.dangerSoft,
    },
    stockBadgeText: {
      fontSize: 11,
      fontWeight: '800',
    },
    emptyLine: {
      fontSize: 12,
      color: c.textMuted,
      paddingVertical: 4,
    },
    generatedAt: {
      fontSize: 11,
      color: c.textFaint,
      textAlign: 'center',
      marginTop: space.lg,
    },
    primaryBtn: {
      marginTop: space.xs,
      paddingHorizontal: space.xl,
      height: 44,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.accent,
    },
    primaryBtnText: {
      color: c.onAccent,
      fontWeight: '700',
      fontSize: 14,
    },
  });
}
