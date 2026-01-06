/**
 * Chat Interface Design Tokens
 *
 * Following Telkom design system from DESIGN_GUIDE.md:
 * - Telkom Red primary color
 * - rounded-4xl for cards (20px radius)
 * - border border-border/70 (70% opacity)
 * - shadow-sm for subtle elevation
 * - tabular-nums for timestamps
 */

export const chatTokens = {
  // Message bubble styling
  bubble: {
    user: "bg-primary text-primary-foreground rounded-4xl rounded-br-sm px-4 py-3 shadow-sm",
    ai: "bg-card border border-border/70 rounded-4xl rounded-bl-sm px-4 py-3 shadow-sm",
  },

  // Typography
  text: {
    message: "text-sm leading-relaxed",
    timestamp: "text-xs text-muted-foreground tabular-nums mt-1",
    label: "text-xs uppercase tracking-widest text-muted-foreground font-medium",
  },

  // Layout
  layout: {
    container: "max-w-3xl mx-auto h-screen flex flex-col",
    messageList: "flex-1 overflow-y-auto p-6 space-y-4",
    messageMaxWidth: "max-w-3/4",
    header: "border-b border-border/50 p-4",
    inputContainer: "border-t border-border/50 p-4",
  },

  // Avatar
  avatar: {
    ai: "h-8 w-8 bg-primary text-primary-foreground",
    user: "h-8 w-8 bg-muted text-muted-foreground",
  },

  // Spacing
  spacing: {
    messagePadding: "px-4 py-3",
    containerPadding: "p-6",
    gap: "gap-4",
  },
} as const;
