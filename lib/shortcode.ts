import { customAlphabet } from "nanoid";

// Unambiguous, URL-safe alphabet (no 0/O/1/l/I) for shortcodes that end up
// on printed signage.
const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
export const generateShortcode = customAlphabet(alphabet, 8);
