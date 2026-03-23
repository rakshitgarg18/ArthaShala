import { API_ENDPOINTS, API_KEYS } from "@/config/api";
import { clearOpenSymbolsCache } from "@/services/opensymbols";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function DebugScreen() {
  const [debugLogs, setDebugLogs] = React.useState<string[]>([]);

  const addLog = (msg: string) => {
    setDebugLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  React.useEffect(() => {
    addLog("Debug Screen Loaded");
    addLog(`EXPO_PUBLIC_OPENROUTER_API_KEY: ${API_KEYS.OPENROUTER ? "SET" : "MISSING"}`);
    addLog(`EXPO_PUBLIC_OPENSYMBOLS_SECRET: ${API_KEYS.OPENSYMBOLS_SECRET ? "SET (" + API_KEYS.OPENSYMBOLS_SECRET.length + " chars)" : "MISSING"}`);
    addLog(`EXPO_PUBLIC_ELEVENLABS_API_KEY: ${API_KEYS.ELEVENLABS ? "SET" : "MISSING"}`);
    addLog(`API_ENDPOINTS.OPENSYMBOLS: ${API_ENDPOINTS.OPENSYMBOLS}`);
  }, []);

  const testPublicAPI = async () => {
    addLog("Testing public API...");
    try {
      const url = `${API_ENDPOINTS.OPENSYMBOLS}/symbols?q=hello&locale=en&safe=1`;
      addLog(`Fetching: ${url}`);
      const response = await fetch(url);
      addLog(`Status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        addLog(`Success! Got ${data.length} results`);
        if (data.length > 0) {
          addLog(`First result: ${data[0].name}`);
        }
      } else {
        const text = await response.text();
        addLog(`Error: ${text.substring(0, 200)}`);
      }
    } catch (error) {
      addLog(`Exception: ${String(error)}`);
    }
  };

  const testTokenEndpoint = async () => {
    addLog("Testing token endpoint...");
    try {
      const url = `${API_ENDPOINTS.OPENSYMBOLS}/token?secret=${encodeURIComponent(
        API_KEYS.OPENSYMBOLS_SECRET
      )}`;
      addLog(`Fetching: ${url.substring(0, 100)}...`);
      const response = await fetch(url, { method: "POST" });
      addLog(`Status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        addLog(`Success! Got token: ${JSON.stringify(data)}`);
      } else {
        const text = await response.text();
        addLog(`Error: ${text}`);
      }
    } catch (error) {
      addLog(`Exception: ${String(error)}`);
    }
  };

  const handleClearCache = async () => {
    addLog("Clearing OpenSymbols cache...");
    await clearOpenSymbolsCache();
    addLog("Cache cleared!");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>API Configuration</Text>
        <Text style={styles.label}>OPENROUTER_API_KEY: {API_KEYS.OPENROUTER ? "✓" : "✗"}</Text>
        <Text style={styles.label}>
          OPENSYMBOLS_SECRET: {API_KEYS.OPENSYMBOLS_SECRET ? `✓ (${API_KEYS.OPENSYMBOLS_SECRET.length} chars)` : "✗"}
        </Text>
        <Text style={styles.label}>ELEVENLABS_API_KEY: {API_KEYS.ELEVENLABS ? "✓" : "✗"}</Text>
        <Text style={styles.label}>OpenSymbols Endpoint: {API_ENDPOINTS.OPENSYMBOLS}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Actions</Text>
        <Pressable style={styles.button} onPress={testPublicAPI}>
          <Text style={styles.buttonText}>Test Public API</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={testTokenEndpoint}>
          <Text style={styles.buttonText}>Test Token Endpoint</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleClearCache}>
          <Text style={styles.buttonText}>Clear Cache</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Debug Logs</Text>
        {debugLogs.map((log, idx) => (
          <Text key={idx} style={styles.log}>
            {log}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: "Calibri",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  log: {
    fontSize: 12,
    fontFamily: "Calibri",
    marginBottom: 4,
    padding: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
  },
});
 
