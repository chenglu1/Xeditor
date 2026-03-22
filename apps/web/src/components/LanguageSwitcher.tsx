import { useState } from 'react';
import type { MouseEvent } from 'react';
import type { ComponentProps } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  SvgIcon,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { SUPPORTED_LANGUAGES } from '../i18n';

function GlobeIcon(props: ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2m6.93 9h-3.06a15.7 15.7 0 0 0-1.38-5.03A8.02 8.02 0 0 1 18.93 11M12 4.04c.83 1.2 1.9 3.61 2.24 6.96H9.76C10.1 7.65 11.17 5.24 12 4.04M7.13 11H4.07a8.02 8.02 0 0 1 4.44-5.03A15.7 15.7 0 0 0 7.13 11m1.05 2h7.64c-.36 3.35-1.43 5.76-2.25 6.96-.82-1.2-1.89-3.61-2.25-6.96M4.07 13h3.06a15.7 15.7 0 0 0 1.38 5.03A8.02 8.02 0 0 1 4.07 13m10.42 5.03A15.7 15.7 0 0 0 15.87 13h3.06a8.02 8.02 0 0 1-4.44 5.03"
      />
    </SvgIcon>
  );
}

function ChevronIcon(props: ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"
      />
    </SvgIcon>
  );
}

function CheckIcon(props: ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M9 16.17l-3.88-3.88L3.71 13.7 9 19l12-12-1.41-1.41z"
      />
    </SvgIcon>
  );
}

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);
  const currentLanguage =
    SUPPORTED_LANGUAGES.find(({ code }) => code === i18n.language) ??
    SUPPORTED_LANGUAGES[0];

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        id="xeditor-language-switcher"
        size="small"
        aria-label={t('app.language.switcher')}
        aria-controls={open ? 'xeditor-language-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="menu"
        onClick={handleOpen}
        startIcon={<GlobeIcon fontSize="small" />}
        endIcon={<ChevronIcon fontSize="small" />}
        sx={{
          ml: { xs: 0.5, md: 1 },
          px: 1.35,
          minWidth: 'auto',
          borderRadius: 999,
          border: '1px solid rgba(124,58,237,0.14)',
          color: 'text.primary',
          bgcolor: open ? 'rgba(124,58,237,0.09)' : 'rgba(124,58,237,0.04)',
          '&:hover': {
            bgcolor: 'rgba(124,58,237,0.09)',
            borderColor: 'rgba(124,58,237,0.22)',
          },
        }}
      >
        <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
          {t(currentLanguage.labelKey)}
        </Box>
        <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
          {currentLanguage.code === 'zh-CN' ? '中' : 'EN'}
        </Box>
      </Button>

      <Menu
        id="xeditor-language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'xeditor-language-switcher',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 220,
            borderRadius: 3,
            border: '1px solid rgba(148,163,184,0.18)',
            boxShadow: '0 24px 48px -22px rgba(15,23,42,.28)',
            overflow: 'hidden',
          },
        }}
      >
        <Box
          sx={{
            px: 1.75,
            py: 1.1,
            borderBottom: '1px solid rgba(148,163,184,0.12)',
            bgcolor: 'rgba(248,250,252,0.86)',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {t('app.language.menuTitle')}
          </Typography>
        </Box>
        {SUPPORTED_LANGUAGES.map(({ code, labelKey }) => {
          const isActive = i18n.language === code;

          return (
            <MenuItem
              key={code}
              selected={isActive}
              onClick={() => {
                void i18n.changeLanguage(code);
                handleClose();
              }}
              sx={{
                gap: 1.5,
                py: 1.2,
                px: 1.5,
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: isActive ? 700 : 500, color: 'text.primary' }}
                >
                  {t(labelKey)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {code}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isActive ? 'primary.main' : 'transparent',
                }}
              >
                <CheckIcon fontSize="small" />
              </Box>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
