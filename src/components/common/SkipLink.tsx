import React from 'react';
import { Box, Link } from '@chakra-ui/react';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  return (
    <Link
      href={href}
      position="absolute"
      top="-40px"
      left="8px"
      bg="brand.600"
      color="white"
      px={4}
      py={2}
      borderRadius="md"
      fontSize="sm"
      fontWeight="medium"
      zIndex={9999}
      textDecoration="none"
      _focus={{
        top: "8px",
        outline: "3px solid",
        outlineColor: "blue.300",
        outlineOffset: "2px"
      }}
      _hover={{
        bg: "brand.700"
      }}
      onClick={(e) => {
        e.preventDefault();
        if (target && target instanceof HTMLElement) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }}
    >
      {children}
    </Link>
  );
};

// Skip links container for multiple links
export const SkipLinks: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box position="relative" role="navigation" aria-label="Skip links">
      {children}
    </Box>
  );
};