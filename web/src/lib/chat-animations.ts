/**
 * Chat Animation Variants (Framer Motion)
 *
 * Following DESIGN_GUIDE.md animation patterns:
 * - Quick interactions: 0.15s - 0.2s
 * - Entrance animations: 0.2s - 0.3s
 * - Stagger delays: 0.05s - 0.08s
 * - Use easeOut for entrances
 */

import type { Variants } from "framer-motion";

/**
 * Message entrance animation (fade in with upward movement)
 */
export const messageFadeIn: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: {
      duration: 0.15,
      ease: "easeIn"
    }
  },
};

/**
 * Stagger container for message list
 */
export const messageListStagger: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

/**
 * Stagger item for individual messages
 */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
};

/**
 * Simple fade animation (no movement)
 */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.15
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.1
    }
  },
};

/**
 * Slide down animation (for headers)
 */
export const slideDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: "easeOut"
    }
  },
};
