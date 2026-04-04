// src/pages/attribute/ColorSizeManagement.jsx
import { useState } from 'react';
import { Palette, Ruler } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ColorList from "./ColorList";
import SizeList from "./SizeList";

/* ══════════════════════════════════════════════════════
   STYLES — Light Ivory / Gold Luxury
══════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

.lux-root {
  min-height: 100vh;
  background: linear-gradient(160deg, #faf8f3 0%, #f5f0e4 55%, #ede9de 100%);
  padding: 32px;
  font-family: 'DM Sans', system-ui, sans-serif;
}

.lux-inner { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }

.lux-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  padding-bottom: 24px; border-bottom: 1.5px solid rgba(184,134,11,0.15);
}
.lux-title {
  font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: #1a1612;
}
.lux-title span { color: #b8860b; }

.lux-tabs-list {
  background: rgba(184,134,11,0.05) !important; border: 1px solid rgba(184,134,11,0.1) !important;
  padding: 4px !important; border-radius: 14px !important;
}
.lux-tab-trigger {
  font-family: 'DM Mono', monospace !important; font-size: 11px !important;
  font-weight: 700 !important; text-transform: uppercase !important;
  padding: 8px 20px !important; border-radius: 10px !important; color: #7a6e5f !important;
}
.lux-tab-trigger[data-state='active'] {
  background: #fff !important; color: #b8860b !important; box-shadow: 0 4px 10px rgba(184,134,11,0.1) !important;
}
`;

const ColorSizeManagement = () => {
    const [activeTab, setActiveTab] = useState('color');

    return (
        <div className="lux-root">
            <style>{STYLES}</style>
            <div className="lux-inner">
                <header className="lux-header">
                    <h1 className="lux-title">Danh mục <span>thuộc tính</span></h1>
                </header>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="lux-tabs-list">
                        <TabsTrigger value="color" className="lux-tab-trigger">
                            <Palette size={14} className="mr-2"/>Màu sắc
                        </TabsTrigger>
                        <TabsTrigger value="size" className="lux-tab-trigger">
                            <Ruler size={14} className="mr-2"/>Kích cỡ
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="color" className="mt-6">
                        <ColorList />
                    </TabsContent>

                    <TabsContent value="size" className="mt-6">
                        <SizeList />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default ColorSizeManagement;