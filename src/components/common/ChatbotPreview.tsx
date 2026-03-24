import { Box, Typography, Avatar, alpha, IconButton } from '@mui/material';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import EmojiObjectsRoundedIcon from '@mui/icons-material/EmojiObjectsRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import AssistantRoundedIcon from '@mui/icons-material/AssistantRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import type { SvgIconProps } from '@mui/material';

export const BOT_ICONS: { key: string; label: string; Icon: React.ComponentType<SvgIconProps> }[] = [
  { key: 'SmartToy',     label: 'Robot',     Icon: SmartToyRoundedIcon },
  { key: 'Psychology',   label: 'Brain',     Icon: PsychologyRoundedIcon },
  { key: 'SupportAgent', label: 'Agent',     Icon: SupportAgentRoundedIcon },
  { key: 'AutoAwesome',  label: 'Sparkle',   Icon: AutoAwesomeRoundedIcon },
  { key: 'RocketLaunch', label: 'Rocket',    Icon: RocketLaunchRoundedIcon },
  { key: 'EmojiObjects', label: 'Idea',      Icon: EmojiObjectsRoundedIcon },
  { key: 'Forum',        label: 'Chat',      Icon: ForumRoundedIcon },
  { key: 'Assistant',    label: 'Assistant', Icon: AssistantRoundedIcon },
  { key: 'Bolt',         label: 'Bolt',      Icon: BoltRoundedIcon },
];

function BotIcon({ iconKey, ...props }: SvgIconProps & { iconKey?: string }) {
  const match = BOT_ICONS.find(i => i.key === iconKey);
  const Icon = match?.Icon ?? SmartToyRoundedIcon;
  return <Icon {...props} />;
}

interface ChatbotPreviewProps {
  primaryColor: string;
  welcomeMessage: string;
  botName: string;
  botIcon?: string;
}

export default function ChatbotPreview({ primaryColor, welcomeMessage, botName, botIcon }: ChatbotPreviewProps) {
  const sampleMessages = [
    { sender: 'bot', text: welcomeMessage },
    { sender: 'user', text: 'What time does build-up start?' },
    { sender: 'bot', text: 'Build-up begins on September 13th at 8:00 AM. All exhibitors should report to their assigned hall entrances.' },
  ];

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 360,
        height: 520,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: '#fff',
        mx: 'auto',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${alpha(primaryColor, 0.75)} 100%)`,
          color: '#fff', px: 2, py: 1.5,
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}
      >
        <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#fff', 0.2), backdropFilter: 'blur(4px)' }}>
          <BotIcon iconKey={botIcon} sx={{ fontSize: 20 }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>{botName}</Typography>
          <Typography sx={{ fontSize: '0.7rem', opacity: 0.8 }}>Online • Typically replies instantly</Typography>
        </Box>
        <IconButton size="small" sx={{ color: alpha('#fff', 0.7), '&:hover': { color: '#fff' } }}>
          <RemoveRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton size="small" sx={{ color: alpha('#fff', 0.7), '&:hover': { color: '#fff' } }}>
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Chat Messages */}
      <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, overflowY: 'auto', bgcolor: '#f8fafc' }}>
        {sampleMessages.map((msg, i) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', gap: 1 }}>
            {msg.sender === 'bot' && (
              <Avatar sx={{ width: 28, height: 28, bgcolor: primaryColor, flexShrink: 0, mt: 0.5 }}>
                <BotIcon iconKey={botIcon} sx={{ fontSize: 14 }} />
              </Avatar>
            )}
            <Box
              sx={{
                maxWidth: '75%', px: 1.5, py: 1,
                borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                bgcolor: msg.sender === 'user' ? primaryColor : '#fff',
                color: msg.sender === 'user' ? '#fff' : '#1e293b',
                boxShadow: msg.sender === 'bot' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                border: msg.sender === 'bot' ? '1px solid rgba(148,163,184,0.15)' : 'none',
              }}
            >
              <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>{msg.text}</Typography>
            </Box>
          </Box>
        ))}

        {/* Typing Indicator */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Avatar sx={{ width: 28, height: 28, bgcolor: primaryColor, flexShrink: 0, mt: 0.5 }}>
            <BotIcon iconKey={botIcon} sx={{ fontSize: 14 }} />
          </Avatar>
          <Box sx={{ px: 1.5, py: 1, borderRadius: '12px 12px 12px 2px', bgcolor: '#fff', border: '1px solid rgba(148,163,184,0.15)', display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {[0, 1, 2].map((dot) => (
              <Box
                key={dot}
                sx={{
                  width: 6, height: 6, borderRadius: '50%',
                  bgcolor: alpha(primaryColor, 0.4),
                  animation: 'bounce 1.4s infinite ease-in-out',
                  animationDelay: `${dot * 0.16}s`,
                  '@keyframes bounce': {
                    '0%, 80%, 100%': { transform: 'scale(0.6)' },
                    '40%': { transform: 'scale(1)' },
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Input */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
        <Box sx={{ flex: 1, px: 1.5, py: 0.8, borderRadius: 2, bgcolor: '#f1f5f9', border: '1px solid rgba(148,163,184,0.2)' }}>
          <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8' }}>Type your message...</Typography>
        </Box>
        <IconButton size="small" sx={{ bgcolor: primaryColor, color: '#fff', '&:hover': { bgcolor: alpha(primaryColor, 0.85) }, width: 34, height: 34 }}>
          <SendRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
