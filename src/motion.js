/* Shared motion vocabulary.
   Short, spring-free where possible — on a debt screen, motion should feel
   calm and quick, not bouncy. */

export const EASE = [0.22, 0.61, 0.36, 1]

/* whole-screen change: slide in from the right, out to the left */
export const screenSlide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -18 },
  transition: { duration: 0.28, ease: EASE },
}

/* the toast rises from the bottom edge */
export const toastRise = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 24 },
  transition: { duration: 0.34, ease: EASE },
}

/* sheet-style entry from below */
export const sheetRise = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 40 },
  transition: { duration: 0.32, ease: EASE },
}

/* Parent that staggers its children in.
   Returns `variants` — not a bare `animate` object, which would clobber the
   animate="animate" label and stop children ever resolving their variants. */
export const stagger = (delay = 0.06, start = 0.05) => ({
  variants: {
    initial: {},
    animate: { transition: { staggerChildren: delay, delayChildren: start } },
  },
})

/* child of a staggered parent */
export const riseItem = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE } },
}

export const fadeItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.26, ease: EASE } },
}

/* the orb settles in rather than popping */
export const orbIn = {
  initial: { opacity: 0, scale: 0.86 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: EASE } },
}

/* press feedback on anything tappable */
export const tap = { whileTap: { scale: 0.985 } }

/* screens that pass the sphere between them cross-fade in place, so the
   shared element is the only thing that appears to move */
export const sharedFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2, ease: EASE },
}
