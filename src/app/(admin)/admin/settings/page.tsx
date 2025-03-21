'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Palette, 
  Save, 
  RotateCcw, 
  Check, 
  Globe,
  Settings2,
  BellRing,
  Users,
  CreditCard,
  Mail,
  Moon,
  Sun,
  GraduationCap,
  Users2,
  Shield
} from 'lucide-react';

// Color scheme types
type ColorScheme = {
  light: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    card: string;
    cardForeground: string;
  };
  dark: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    card: string;
    cardForeground: string;
  };
};

// Default color scheme that matches current site colors
const defaultColors: ColorScheme = {
  light: {
    primary: '#7CA4CB',     // Regent St Blue
    secondary: '#6366f1',   // indigo-500
    accent: '#9CC3E2',      // Lighter blue
    background: '#ffffff',  // white
    foreground: '#4C5F56',  // Finch
    muted: '#E2E4E1',       // Tasman
    mutedForeground: '#64748b', // slate-500
    border: '#E2E4E1',      // Tasman
    card: '#ffffff',        // white
    cardForeground: '#4C5F56', // Finch
  },
  dark: {
    primary: '#7CA4CB',     // Regent St Blue
    secondary: '#818cf8',    // indigo-400
    accent: '#9CC3E2',       // Lighter blue
    background: '#4C5F56',   // Finch
    foreground: '#E2E4E1',   // Tasman
    muted: '#3D4C45',        // Darker Finch
    mutedForeground: '#94a3b8', // slate-400
    border: '#5A7068',       // Lighter Finch
    card: '#3D4C45',         // Darker Finch
    cardForeground: '#E2E4E1', // Tasman
  },
};

export default function SettingsPage() {
  const [colors, setColors] = useState<ColorScheme>(defaultColors);
  const [savedColors, setSavedColors] = useState<ColorScheme>(defaultColors);
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>('light');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Load saved colors on initial render
  useEffect(() => {
    // Detect current theme mode (light/dark)
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setActiveTheme(isDarkMode ? 'dark' : 'light');
    
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('siteTheme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme) as ColorScheme;
        setColors(parsedTheme);
        setSavedColors(parsedTheme);
        
        // Apply the saved theme immediately
        applyThemeToDOM(parsedTheme, isDarkMode ? 'dark' : 'light');
      } catch (error) {
        console.error('Error parsing saved theme:', error);
      }
    } else {
      // If no saved theme, apply default theme
      applyThemeToDOM(defaultColors, isDarkMode ? 'dark' : 'light');
    }
  }, []);

  // Apply theme to DOM by setting CSS variables
  const applyThemeToDOM = (themeColors: ColorScheme, mode: 'light' | 'dark') => {
    const currentMode = themeColors[mode];
    
    // Set the data-theme attribute to control light/dark mode
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Convert hex colors to HSL for CSS variables
    const convertedColors = {
      background: hexToHSL(currentMode.background),
      foreground: hexToHSL(currentMode.foreground),
      primary: hexToHSL(currentMode.primary),
      secondary: hexToHSL(currentMode.secondary),
      accent: hexToHSL(currentMode.accent),
      muted: hexToHSL(currentMode.muted),
      mutedForeground: hexToHSL(currentMode.mutedForeground),
      border: hexToHSL(currentMode.border),
      card: hexToHSL(currentMode.card),
      cardForeground: hexToHSL(currentMode.cardForeground),
    };
    
    // Apply HSL values to CSS variables
    Object.entries(convertedColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
    
    // Set foreground colors based on contrast
    document.documentElement.style.setProperty('--primary-foreground', hexToHSL(getContrastColor(currentMode.primary)));
    document.documentElement.style.setProperty('--secondary-foreground', hexToHSL(getContrastColor(currentMode.secondary)));
    document.documentElement.style.setProperty('--accent-foreground', hexToHSL(getContrastColor(currentMode.accent)));
  };
  
  // Helper function to determine if a color should have white or black text on it
  const getContrastColor = (hexColor: string) => {
    // Remove the hash if it exists
    hexColor = hexColor.replace('#', '');
    
    // Parse the color
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    
    // Calculate the brightness (YIQ equation)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // Return black for bright colors, white for dark ones
    return yiq >= 128 ? '#000000' : '#ffffff';
  };
  
  // Helper function to convert hex to HSL string for CSS variables
  const hexToHSL = (hex: string): string => {
    // Remove the hash if it exists
    hex = hex.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Find greatest and smallest channel values
    const cmin = Math.min(r, g, b);
    const cmax = Math.max(r, g, b);
    const delta = cmax - cmin;
    
    let h = 0;
    let s = 0;
    let l = 0;
    
    // Calculate hue
    if (delta === 0) {
      h = 0;
    } else if (cmax === r) {
      h = ((g - b) / delta) % 6;
    } else if (cmax === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    
    // Calculate lightness
    l = (cmax + cmin) / 2;
    
    // Calculate saturation
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    
    // Convert to percentages
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    return `${h} ${s}% ${l}%`;
  };
  
  // Handle color change for a specific theme mode
  const handleColorChange = (mode: 'light' | 'dark', colorKey: keyof ColorScheme['light'], value: string) => {
    setColors(prev => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [colorKey]: value
      }
    }));
    
    if (previewMode) {
      // If preview mode is on, apply changes immediately
      applyThemeToDOM({
        ...colors,
        [mode]: {
          ...colors[mode],
          [colorKey]: value
        }
      }, activeTheme);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('siteTheme', JSON.stringify(colors));
      
      // Apply the current theme
      applyThemeToDOM(colors, activeTheme);
      
      setSavedColors(colors);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving theme:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setColors(defaultColors);
    if (previewMode) {
      applyThemeToDOM(defaultColors, activeTheme);
    }
  };
  
  const toggleThemeMode = () => {
    const newMode = activeTheme === 'light' ? 'dark' : 'light';
    setActiveTheme(newMode);
    applyThemeToDOM(colors, newMode);
  };
  
  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
    if (!previewMode) {
      // Turning preview on - apply current edited colors
      applyThemeToDOM(colors, activeTheme);
    } else {
      // Turning preview off - revert to saved colors
      applyThemeToDOM(savedColors, activeTheme);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      {showSuccess && (
        <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4 flex items-center gap-2">
          <Check className="h-5 w-5" />
          Settings saved successfully!
        </div>
      )}

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <BellRing className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="payments" className="hidden lg:flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your website by changing the color scheme for both light and dark modes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeTheme === 'light' ? 'bg-secondary text-white shadow-lg' : 'bg-muted'}`}
                    onClick={() => setActiveTheme('light')}
                    aria-label="Switch to light mode"
                  >
                    <Sun className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeTheme === 'dark' ? 'bg-secondary text-white shadow-lg' : 'bg-muted'}`}
                    onClick={() => setActiveTheme('dark')}
                    aria-label="Switch to dark mode"
                  >
                    <Moon className="h-5 w-5" />
                  </button>
                  <span className="font-medium">
                    {activeTheme === 'light' ? 'Light Mode' : 'Dark Mode'} Settings
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Preview Changes</span>
                  <Switch
                    checked={previewMode}
                    onCheckedChange={togglePreviewMode}
                    aria-label="Toggle preview mode"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Main Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          id="primaryColorPicker"
                          className="w-10 h-10 rounded border p-0 cursor-pointer"
                          value={colors[activeTheme].primary}
                          onChange={(e) => handleColorChange(activeTheme, 'primary', e.target.value)}
                        />
                        <Input 
                          id="primaryColor" 
                          type="text" 
                          value={colors[activeTheme].primary} 
                          onChange={(e) => handleColorChange(activeTheme, 'primary', e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="accentColor">Accent Color</Label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          id="accentColorPicker"
                          className="w-10 h-10 rounded border p-0 cursor-pointer"
                          value={colors[activeTheme].accent}
                          onChange={(e) => handleColorChange(activeTheme, 'accent', e.target.value)}
                        />
                        <Input 
                          id="accentColor" 
                          type="text" 
                          value={colors[activeTheme].accent} 
                          onChange={(e) => handleColorChange(activeTheme, 'accent', e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Text & Background</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="foregroundColor">Text Color</Label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          id="foregroundColorPicker"
                          className="w-10 h-10 rounded border p-0 cursor-pointer"
                          value={colors[activeTheme].foreground}
                          onChange={(e) => handleColorChange(activeTheme, 'foreground', e.target.value)}
                        />
                        <Input 
                          id="foregroundColor" 
                          type="text" 
                          value={colors[activeTheme].foreground} 
                          onChange={(e) => handleColorChange(activeTheme, 'foreground', e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="backgroundColor">Background Color</Label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          id="backgroundColorPicker"
                          className="w-10 h-10 rounded border p-0 cursor-pointer"
                          value={colors[activeTheme].background}
                          onChange={(e) => handleColorChange(activeTheme, 'background', e.target.value)}
                        />
                        <Input 
                          id="backgroundColor" 
                          type="text" 
                          value={colors[activeTheme].background} 
                          onChange={(e) => handleColorChange(activeTheme, 'background', e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Gradient Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="gradientStart">Gradient Start</Label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          id="gradientStartPicker"
                          className="w-10 h-10 rounded border p-0 cursor-pointer"
                          value={colors[activeTheme].primary}
                          onChange={(e) => handleColorChange(activeTheme, 'primary', e.target.value)}
                        />
                        <Input 
                          id="gradientStart" 
                          type="text" 
                          value={colors[activeTheme].primary} 
                          onChange={(e) => handleColorChange(activeTheme, 'primary', e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="gradientEnd">Gradient End</Label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          id="gradientEndPicker"
                          className="w-10 h-10 rounded border p-0 cursor-pointer"
                          value={colors[activeTheme].accent}
                          onChange={(e) => handleColorChange(activeTheme, 'accent', e.target.value)}
                        />
                        <Input 
                          id="gradientEnd" 
                          type="text" 
                          value={colors[activeTheme].accent} 
                          onChange={(e) => handleColorChange(activeTheme, 'accent', e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 p-4 rounded-md" style={{ background: `linear-gradient(to right, ${colors[activeTheme].primary}, ${colors[activeTheme].accent})` }}>
                    <p className="text-center font-bold text-white text-shadow">Gradient Preview</p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Card & Border Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="grid gap-2">
                      <Label htmlFor="cardColor">Card Background</Label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          id="cardColorPicker"
                          className="w-10 h-10 rounded border p-0 cursor-pointer"
                          value={colors[activeTheme].card}
                          onChange={(e) => handleColorChange(activeTheme, 'card', e.target.value)}
                        />
                        <Input 
                          id="cardColor" 
                          type="text" 
                          value={colors[activeTheme].card} 
                          onChange={(e) => handleColorChange(activeTheme, 'card', e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="grid gap-2">
                      <Label htmlFor="cardForegroundColor">Card Text Color</Label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          id="cardForegroundColorPicker"
                          className="w-10 h-10 rounded border p-0 cursor-pointer"
                          value={colors[activeTheme].cardForeground}
                          onChange={(e) => handleColorChange(activeTheme, 'cardForeground', e.target.value)}
                        />
                        <Input 
                          id="cardForegroundColor" 
                          type="text" 
                          value={colors[activeTheme].cardForeground} 
                          onChange={(e) => handleColorChange(activeTheme, 'cardForeground', e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <div className="grid gap-2">
                      <Label htmlFor="mutedColor">Muted Background</Label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          id="mutedColorPicker"
                          className="w-10 h-10 rounded border p-0 cursor-pointer"
                          value={colors[activeTheme].muted}
                          onChange={(e) => handleColorChange(activeTheme, 'muted', e.target.value)}
                        />
                        <Input 
                          id="mutedColor" 
                          type="text" 
                          value={colors[activeTheme].muted} 
                          onChange={(e) => handleColorChange(activeTheme, 'muted', e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="grid gap-2">
                      <Label htmlFor="mutedForegroundColor">Muted Text Color</Label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          id="mutedForegroundColorPicker"
                          className="w-10 h-10 rounded border p-0 cursor-pointer"
                          value={colors[activeTheme].mutedForeground}
                          onChange={(e) => handleColorChange(activeTheme, 'mutedForeground', e.target.value)}
                        />
                        <Input 
                          id="mutedForegroundColor" 
                          type="text" 
                          value={colors[activeTheme].mutedForeground} 
                          onChange={(e) => handleColorChange(activeTheme, 'mutedForeground', e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <div className="grid gap-2">
                      <Label htmlFor="borderColor">Border Color</Label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          id="borderColorPicker"
                          className="w-10 h-10 rounded border p-0 cursor-pointer"
                          value={colors[activeTheme].border}
                          onChange={(e) => handleColorChange(activeTheme, 'border', e.target.value)}
                        />
                        <Input 
                          id="borderColor" 
                          type="text" 
                          value={colors[activeTheme].border} 
                          onChange={(e) => handleColorChange(activeTheme, 'border', e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-medium">Preview</h3>
                <div className="border rounded-md overflow-hidden shadow-md" style={{ borderColor: colors[activeTheme].border }}>
                  <div 
                    className="p-4 font-medium flex items-center justify-between" 
                    style={{ backgroundColor: colors[activeTheme].muted, color: colors[activeTheme].mutedForeground }}
                  >
                    <div className="font-bold flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Sample Header
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: colors[activeTheme].accent, color: getContrastColor(colors[activeTheme].accent) }}>
                        {activeTheme === 'light' ? 'Light Mode' : 'Dark Mode'}
                      </span>
                    </div>
                  </div>
                  <div 
                    className="p-6" 
                    style={{ backgroundColor: colors[activeTheme].background, color: colors[activeTheme].foreground }}
                  >
                    <div className="p-4 mb-4 rounded shadow-sm" style={{ backgroundColor: colors[activeTheme].card, color: colors[activeTheme].cardForeground, borderColor: colors[activeTheme].border, borderWidth: '1px' }}>
                      <h2 className="text-xl font-bold mb-2" style={{ color: colors[activeTheme].primary }}>
                        Card Example
                      </h2>
                      <p>This is how cards will look with the selected colors.</p>
                      <div className="mt-3 pt-3" style={{ borderTopWidth: '1px', borderColor: colors[activeTheme].border }}>
                        <span className="text-xs" style={{ color: colors[activeTheme].mutedForeground }}>Card footer with muted text</span>
                      </div>
                    </div>
                    
                    <p className="mb-4">Content area with <span style={{ color: colors[activeTheme].primary }}>primary</span> and <span style={{ color: colors[activeTheme].accent }}>accent</span> text colors.</p>
                    
                    <div className="flex flex-wrap gap-2">
                      <button 
                        className="px-4 py-2 rounded shadow-sm" 
                        style={{ backgroundColor: colors[activeTheme].primary, color: getContrastColor(colors[activeTheme].primary) }}
                      >
                        Primary Button
                      </button>
                      <button 
                        className="px-4 py-2 rounded shadow-sm" 
                        style={{ backgroundColor: colors[activeTheme].accent, color: getContrastColor(colors[activeTheme].accent) }}
                      >
                        Accent Button
                      </button>
                    </div>
                    
                    <div className="mt-4 p-4 rounded-md" style={{ background: `linear-gradient(to right, ${colors[activeTheme].primary}, ${colors[activeTheme].accent})` }}>
                      <p className="text-center font-bold text-white">Gradient Example</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" /> Reset to Default
                </Button>
                <Button 
                  variant="outline" 
                  onClick={toggleThemeMode}
                  className="gap-2"
                >
                  {activeTheme === 'light' ? (
                    <>
                      <Moon className="h-4 w-4" />
                      Preview Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4" />
                      Preview Light Mode
                    </>
                  )}
                </Button>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general website settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input id="siteName" defaultValue="Speaker's Circle" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Input id="siteDescription" defaultValue="A platform for public speaking events and classes" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteURL">Site URL</Label>
                <Input id="siteURL" defaultValue="https://speakerscircle.com" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto gap-2">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure email templates and notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border p-4 rounded-md hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" /> User Registration
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">Welcome email for new users</p>
                  </div>
                  <div className="border p-4 rounded-md hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Payment Confirmation
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">Sent after successful payment</p>
                  </div>
                  <div className="border p-4 rounded-md hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium flex items-center gap-2">
                      <BellRing className="h-4 w-4" /> Event Reminder
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">Reminder before upcoming events</p>
                  </div>
                  <div className="border p-4 rounded-md hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Newsletter
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">Regular newsletter template</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Roles & Permissions</CardTitle>
              <CardDescription>
                Configure user roles and permission settings for the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">User Roles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border p-4 rounded-md space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" /> Student
                    </h4>
                    <p className="text-sm text-gray-600">Students enrolled in classes with access to curriculum and progress tracking.</p>
                  </div>
                  <div className="border p-4 rounded-md space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Users2 className="h-4 w-4" /> Parent
                    </h4>
                    <p className="text-sm text-gray-600">Parents with access to view their children's progress and manage enrollments.</p>
                  </div>
                  <div className="border p-4 rounded-md space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" /> Mentor
                    </h4>
                    <p className="text-sm text-gray-600">Mentors who can create content, provide feedback, and guide students.</p>
                  </div>
                  <div className="border p-4 rounded-md space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Admin
                    </h4>
                    <p className="text-sm text-gray-600">Administrators with full access to manage the platform.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Permission Settings</h3>
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-muted p-3 font-medium grid grid-cols-5 text-sm">
                    <div>Resource</div>
                    <div>Create</div>
                    <div>Read</div>
                    <div>Update</div>
                    <div>Delete</div>
                  </div>
                  <div className="divide-y">
                    <div className="grid grid-cols-5 p-3 items-center">
                      <div className="font-medium">Classes</div>
                      <div>Admin, Mentor</div>
                      <div>All Users</div>
                      <div>Admin, Mentor</div>
                      <div>Admin</div>
                    </div>
                    <div className="grid grid-cols-5 p-3 items-center">
                      <div className="font-medium">Curriculum</div>
                      <div>Admin, Mentor</div>
                      <div>Students, Parents, Mentors</div>
                      <div>Admin, Mentor</div>
                      <div>Admin</div>
                    </div>
                    <div className="grid grid-cols-5 p-3 items-center">
                      <div className="font-medium">Announcements</div>
                      <div>Admin, Mentor</div>
                      <div>All Users</div>
                      <div>Admin, Mentor</div>
                      <div>Admin</div>
                    </div>
                    <div className="grid grid-cols-5 p-3 items-center">
                      <div className="font-medium">User Accounts</div>
                      <div>Admin</div>
                      <div>Admin</div>
                      <div>Admin</div>
                      <div>Admin</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Note: These are simplified permission settings. For detailed configuration, use the Users Management section.</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Parent-Student Relationship</h3>
                <div className="p-4 border rounded-md space-y-3">
                  <p className="text-sm">Parents can view information for all their children but cannot access student accounts directly.</p>
                  <div className="flex items-center space-x-2">
                    <Switch id="allow-parent-view" defaultChecked />
                    <Label htmlFor="allow-parent-view">Allow parents to view student progress</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="allow-parent-enroll" defaultChecked />
                    <Label htmlFor="allow-parent-enroll">Allow parents to enroll students in classes</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto gap-2">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure payment methods and options.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Payment settings content will go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
