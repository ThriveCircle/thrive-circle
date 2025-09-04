import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Drawer, Box, IconButton, Typography, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AnimatePresence, motion } from 'framer-motion';

interface DrawerOptions {
  title?: string;
  width?: number | string;
}

interface RightDrawerContextValue {
  openDrawer: (content: React.ReactNode, options?: DrawerOptions) => void;
  closeDrawer: () => void;
}

const RightDrawerContext = createContext<RightDrawerContextValue | undefined>(undefined);

export const useRightDrawer = (): RightDrawerContextValue => {
  const ctx = useContext(RightDrawerContext);
  if (!ctx) throw new Error('useRightDrawer must be used within RightDrawerProvider');
  return ctx;
};

export const RightDrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<React.ReactNode>(null);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [width, setWidth] = useState<number | string>(420);

  const openDrawer = useCallback((node: React.ReactNode, options?: DrawerOptions) => {
    setContent(node);
    setTitle(options?.title);
    setWidth(options?.width ?? 420);
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ openDrawer, closeDrawer }), [openDrawer, closeDrawer]);

  return (
    <RightDrawerContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <Drawer
            anchor="right"
            open={isOpen}
            onClose={closeDrawer}
            PaperProps={{ sx: { width, overflow: 'hidden' } }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 1 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>{title}</Typography>
              <IconButton onClick={closeDrawer}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider />
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ height: '100%', overflowY: 'auto' }}
            >
              <Box sx={{ p: 2 }}>
                {content}
              </Box>
            </motion.div>
          </Drawer>
        )}
      </AnimatePresence>
    </RightDrawerContext.Provider>
  );
};


