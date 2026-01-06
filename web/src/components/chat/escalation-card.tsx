/**
 * Escalation Card Component
 * 
 * Displays customer service agent information when ticket is escalated
 */

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Clock, CheckCircle2 } from "lucide-react";

interface EscalationCardProps {
  urgency: string;
  priority: string;
  reason: 'ml' | 'llm';
}

export function EscalationCard({ urgency, priority, reason }: EscalationCardProps) {
  // Dummy customer service agent data
  const agent = {
    name: "Siti Nurhaliza",
    role: "Customer Service Agent",
    phone: "+62 821-1234-5678",
    email: "support@telkom.co.id",
    avatar: "/profile.png",
    estimatedResponse: "5-10 menit",
  };

  return (
    <div className="mt-4">
      {/* Notification Banner */}
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
        <span>Masalah Anda memerlukan perhatian segera. Silakan hubungi tim kami untuk bantuan langsung.</span>
      </div>

      {/* Customer Service Card */}
      <Card className="p-5 bg-linear-to-br from-card to-muted/20 border-primary/30 shadow-lg">
        <div className="flex items-start gap-4">
          {/* Agent Avatar */}
          <div className="relative">
            <div className="h-16 w-16 rounded-full overflow-hidden shrink-0 shadow-md border-2 border-primary/20 ring-2 ring-primary/10">
              <Image
                src={agent.avatar}
                alt={agent.name}
                width={64}
                height={64}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-card" />
          </div>

          {/* Agent Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className="font-bold text-base text-foreground">
                  {agent.name}
                </h4>
                <p className="text-xs text-muted-foreground font-medium">
                  {agent.role}
                </p>
              </div>
              <Badge variant="destructive" className="text-xs font-semibold px-2.5 py-0.5">
                {priority}
              </Badge>
            </div>

            {/* Contact Actions */}
            <div className="mt-4 space-y-2">
              <Button
                asChild
                className="w-full justify-start gap-3 h-auto py-2.5 px-3 bg-primary hover:bg-primary/90"
              >
                <a href={`tel:${agent.phone}`}>
                  <div className="h-8 w-8 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-xs font-medium opacity-90">Telepon Sekarang</div>
                    <div className="text-xs font-mono font-semibold">{agent.phone}</div>
                  </div>
                </a>
              </Button>
              
              <Button
                asChild
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-2.5 px-3 border-primary/30 hover:bg-primary/5"
              >
                <a href={`mailto:${agent.email}`}>
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-xs font-medium text-muted-foreground">Kirim Email</div>
                    <div className="text-xs font-semibold text-foreground truncate">{agent.email}</div>
                  </div>
                </a>
              </Button>
            </div>

            {/* Response Time Info */}
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Estimasi respons: <strong className="text-foreground font-semibold">{agent.estimatedResponse}</strong></span>
            </div>
          </div>
        </div>

        {/* Escalation Footer */}
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-center">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Tiket Tereskalasi Otomatis
          </span>
        </div>
      </Card>
    </div>
  );
}
