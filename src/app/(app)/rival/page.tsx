
import { RivalConfigForm } from "@/components/rival/rival-config-form";
import { GlassCard } from "@/components/shared/glass-card";
import { ShieldAlert } from "lucide-react";

export default function RivalPage() {
  return (
    <div className="space-y-4">
      <GlassCard className="p-4">
        <h1 className="text-2xl font-pixel text-primary mb-4 flex items-center">
          <ShieldAlert className="mr-2.5 h-7 w-7" />
          AI Rival Customization
        </h1>
        <p className="text-muted-foreground mb-4 font-mono text-sm">
          Fine-tune how your AI Rival gains XP. The rival is designed to keep you on your toes!
          It will gain XP based on your inactivity or missed goals, according to the rules you set here.
        </p>
      </GlassCard>
      <RivalConfigForm />
    </div>
  );
}
