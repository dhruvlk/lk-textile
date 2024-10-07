// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Autocomplete(theme: any) {
  return {
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          boxShadow: theme.customShadows.z20
        }
      }
    }
  };
}
