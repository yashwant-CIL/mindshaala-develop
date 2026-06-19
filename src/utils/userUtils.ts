/**
 * Extracts the initials from a full name.
 * Examples:
 * "John Doe" -> "JD"
 * "John Michael Doe" -> "JD" (first and last)
 * "Admin" -> "AD" (first and last char if only one word, or just first char if short)
 * 
 * @param name The full name of the user
 * @returns A string representing the user's initials
 */
export const getInitials = (name: string | null | undefined): string => {
    if (!name) return "US";
    
    const trimmedName = name.trim();
    if (!trimmedName) return "US";

    const parts = trimmedName.split(/\s+/);
    
    if (parts.length === 0) return "US";
    
    if (parts.length === 1) {
        // If it's just one word, take the first two characters (if possible) or just the first
        const firstPart = parts[0];
        if (firstPart.length >= 2) {
            return (firstPart[0] + firstPart[1]).toUpperCase();
        }
        return firstPart[0].toUpperCase();
    }
    
    // Take the first character of the first part and the first character of the last part
    const firstChar = parts[0][0];
    const lastChar = parts[parts.length - 1][0];
    
    return (firstChar + lastChar).toUpperCase();
};
