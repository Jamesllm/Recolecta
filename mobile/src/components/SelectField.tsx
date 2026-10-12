// Selector con búsqueda (departamento, provincia y distrito)
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState, type ComponentProps } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '@/lib/theme';

export interface Option {
  id: string;
  label: string;
}

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function SelectField({ label, icon, placeholder, options, value, onChange, disabled, loading, error }: {
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  placeholder: string;
  options: Option[];
  value: string | null;
  onChange: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((o) => o.id === value);
  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return q ? options.filter((o) => normalize(o.label).includes(q)) : options;
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      <Pressable
        style={[s.input, !!error && s.inputError, disabled && { opacity: 0.5 }]}
        onPress={() => setOpen(true)}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label || placeholder}`}
      >
        <Ionicons name={icon} size={20} color={colors.muted} />
        <Text style={[s.value, !selected && { color: '#94A3B8' }]} numberOfLines={1}>{selected?.label || placeholder}</Text>
        {loading ? <ActivityIndicator color={colors.primary} /> : <Ionicons name="chevron-down" size={20} color={colors.muted} />}
      </Pressable>
      {error && <Text style={s.error}>{error}</Text>}

      <Modal visible={open} animationType="slide" onRequestClose={close} statusBarTranslucent navigationBarTranslucent>
        {/* El Modal es otra ventana: necesita su propio proveedor para medir la barra de estado */}
        <SafeAreaProvider>
        <SafeAreaView edges={['top', 'bottom']} style={s.modal}>
          <View style={s.header}>
            <Text style={s.title}>{label}</Text>
            <Pressable onPress={close} hitSlop={10} accessibilityLabel="Cerrar">
              <Ionicons name="close" size={26} color={colors.ink} />
            </Pressable>
          </View>
          <View style={s.search}>
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput value={query} onChangeText={setQuery} placeholder="Buscar…" placeholderTextColor="#94A3B8" style={s.searchInput} autoFocus />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(o) => o.id}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => <View style={s.sep} />}
            ListEmptyComponent={<Text style={s.empty}>Sin resultados.</Text>}
            renderItem={({ item }) => (
              <Pressable
                style={s.option}
                onPress={() => {
                  onChange(item.id);
                  close();
                }}
              >
                <Text style={[s.optionText, item.id === value && { color: colors.primary, fontWeight: '700' }]}>{item.label}</Text>
                {item.id === value && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </Pressable>
            )}
          />
        </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: colors.ink },
  input: { height: 52, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 },
  inputError: { borderColor: colors.danger },
  value: { flex: 1, fontSize: 16, color: colors.ink },
  error: { fontSize: 12.5, color: colors.danger },
  modal: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: colors.ink },
  search: { height: 46, borderRadius: radius.md, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
  searchInput: { flex: 1, fontSize: 16, color: colors.ink },
  sep: { height: 1, backgroundColor: colors.border },
  option: { paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionText: { fontSize: 16, color: colors.text },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 24 },
});
