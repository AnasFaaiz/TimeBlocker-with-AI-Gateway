import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        Port: 5175,
        strictPort: true,
        host: true,
        // open: true,
    }
});
