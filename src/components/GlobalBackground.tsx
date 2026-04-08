import GridScan from './GridScan';
import { useTheme } from '../lib/ThemeContext';

export default function GlobalBackground() {
  const { theme } = useTheme();
  
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none">
      <GridScan 
        gridColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(20, 20, 20, 0.12)'}
        scanColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(20, 20, 20, 0.3)'}
      />
    </div>
  );
}
