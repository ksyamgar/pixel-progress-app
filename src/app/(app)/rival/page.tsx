
import { RivalConfigForm } from "@/components/rival/rival-config-form";
import { GlassCard } from "@/components/shared/glass-card";
import { ShieldAlert } from "lucide-react";

export default function RivalPage() {
  return (
    <div className="space-y-6">
      <GlassCard className="p-4 md:p-6">
        <h1 className="text-3xl font-pixel text-primary mb-6 flex items-center">
          <ShieldAlert className="mr-3 h-8 w-8" />
          AI Rival Customization
        </h1>
        <p className="text-muted-foreground mb-6 font-mono">
          Fine-tune how your AI Rival gains XP. The rival is designed to keep you on your toes!
          It will gain XP based on your inactivity or missed goals, according to the rules you set here.
        </p>
      </GlassCard>
      <RivalConfigForm />
    </div>
  );
}

    