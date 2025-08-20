import React from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { CURRENCIES, CURRENCY_LABELS, CURRENCY_SYMBOLS } from "../constants";
import { formatNumberForDisplay } from "../services/calculatorService";
import { HistoryEntry } from "../types";
import { TrashIcon } from "./icons/TrashIcon";

interface HistoryScreenProps {
  history: HistoryEntry[];
  clearHistory: () => void;
}

const HistoryItem: React.FC<{ entry: HistoryEntry }> = ({ entry }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // Styles are self-contained and already migrated, no changes needed here.
  const styles = StyleSheet.create({
    root: {
      padding: 16,
      backgroundColor: isDarkMode ? "#1e293b" : "#fff",
      borderRadius: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    inputCurrencyContainer: {
      marginBottom: 8,
    },
    inputCurrencyLabel: {
      fontSize: 12,
      color: isDarkMode ? "#94a3b8" : "#64748b",
    },
    inputCurrencyValue: {
      fontWeight: "600",
    },
    expression: {
      fontSize: 18,
      color: isDarkMode ? "#e2e8f0" : "#334155",
      fontFamily: "monospace",
      marginBottom: 8,
    },
    resultContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    equalSign: {
      fontWeight: "400",
      color: isDarkMode ? "#e2e8f0" : "#1e293b",
      marginRight: 8,
    },
    results: {
      flex: 1,
      flexDirection: "row",
      flexWrap: "wrap",
    },
    resultItem: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    resultValue: {
      fontSize: 16,
      fontWeight: "600",
      color: isDarkMode ? "#818cf8" : "#4f46e5",
    },
    resultCurrency: {
      fontSize: 14,
      fontWeight: "400",
      marginLeft: 4,
      color: isDarkMode ? "#cbd5e1" : "#475569",
    },
    separator: {
      marginHorizontal: 6,
      color: isDarkMode ? "#64748b" : "#94a3b8",
    },
    divider: {
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? "#334155" : "#e2e8f0",
      marginTop: 8,
      paddingTop: 8,
    },
    timestamp: {
      fontSize: 12,
      color: isDarkMode ? "#64748b" : "#94a3b8",
      textAlign: "right",
    },
  });

  return (
    <View style={styles.root}>
      <View style={styles.inputCurrencyContainer}>
        <Text style={styles.inputCurrencyLabel}>
          Moneda de entrada:{" "}
          <Text style={styles.inputCurrencyValue}>
            {CURRENCY_LABELS[entry.inputCurrency]}
          </Text>
        </Text>
      </View>
      <Text style={styles.expression} selectable>
        {entry.expression}
      </Text>
      <View style={styles.resultContainer}>
        <Text style={styles.equalSign}>=</Text>
        <View style={styles.results}>
          {CURRENCIES.map((currency, index) => (
            <React.Fragment key={currency}>
              <View style={styles.resultItem}>
                <Text style={styles.resultValue}>
                  {formatNumberForDisplay(
                    entry.results[currency] || 0,
                    2,
                    true
                  )}
                </Text>
                <Text style={styles.resultCurrency}>
                  {CURRENCY_SYMBOLS[currency]}
                </Text>
              </View>
              {index < CURRENCIES.length - 1 && (
                <Text style={styles.separator}>-</Text>
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
      <View style={styles.divider}>
        <Text style={styles.timestamp}>
          {new Date(entry.timestamp).toLocaleString("es-VE", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </Text>
      </View>
    </View>
  );
};

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  history,
  clearHistory,
}) => {
  const validHistory = history.filter(
    (entry) => entry.results && entry.inputCurrency
  );
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const clearButtonStyle = ({ pressed }: { pressed: boolean }) => [
    styles.clearButton,
    pressed && styles.clearButtonPressed
  ];

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode ? styles.safeAreaDark : styles.safeAreaLight]}>
      <View style={styles.container}>
        {validHistory.length > 0 && (
          <View style={styles.clearButtonContainer}>
            <TouchableOpacity
              onPress={clearHistory}
              style={clearButtonStyle}
              accessibilityLabel="Limpiar historial"
            >
              <TrashIcon width={16} height={16} stroke="#FFFFFF" />
              <Text style={styles.clearButtonText}>Limpiar Historial</Text>
            </TouchableOpacity>
          </View>
        )}
        {validHistory.length === 0 ? (
          <View style={styles.emptyHistoryContainer}>
            <Text style={[styles.emptyHistoryText, isDarkMode ? styles.emptyHistoryTextDark : styles.emptyHistoryTextLight]}>
              No hay operaciones en el historial.
            </Text>
          </View>
        ) : (
          <FlatList
            data={validHistory}
            renderItem={({ item }) => <HistoryItem entry={item} />}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  safeAreaLight: {
    backgroundColor: '#f1f5f9', // slate-100
  },
  safeAreaDark: {
    backgroundColor: '#0f172a', // slate-900
  },
  container: {
    flex: 1,
    padding: 16,
    overflow: 'hidden',
  },
  clearButtonContainer: {
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#ef4444", // red-500
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clearButtonPressed: {
    backgroundColor: "#dc2626", // red-600
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8, // for mr-2 on icon
  },
  emptyHistoryContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyHistoryText: {
    fontSize: 18,
  },
  emptyHistoryTextLight: {
    color: '#64748b', // slate-500
  },
  emptyHistoryTextDark: {
    color: '#94a3b8', // slate-400
  },
  listSeparator: {
    height: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
});
