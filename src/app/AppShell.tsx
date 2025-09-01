import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Chip,
  Collapse,
  Select,
  FormControl,
  Avatar,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  SmartToy as SmartToyIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Psychology as PsychologyIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Task as TaskIcon,
  Chat as ChatIcon,
  Receipt as ReceiptIcon,
  BarChart as BarChartIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

const drawerWidth = 280;
const collapsedDrawerWidth = 72;

const navigationItems = [
  { path: "/", label: "Dashboard", icon: <DashboardIcon /> },
  { path: "/clients", label: "Clients", icon: <PeopleIcon /> },
  { path: "/coaches", label: "Coaches", icon: <PsychologyIcon /> },
  { path: "/programs", label: "Programs", icon: <SchoolIcon /> },
  { path: "/assessments", label: "Assessments", icon: <AssessmentIcon /> },
  { path: "/sessions", label: "Sessions", icon: <EventIcon /> },
  { path: "/tasks", label: "Tasks", icon: <TaskIcon /> },
  { path: "/messages", label: "Messages", icon: <ChatIcon /> },
  { path: "/billing", label: "Billing", icon: <ReceiptIcon /> },
  { path: "/reports", label: "Reports", icon: <BarChartIcon /> },
  { path: "/ai-coach", label: "AI Coach", icon: <SmartToyIcon /> },
  { path: "/settings", label: "Settings", icon: <SettingsIcon /> },
];

export const AppShell: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [userRole, setUserRole] = useState<"admin" | "coach" | "client">(
    "admin",
  );
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    avatar: string;
    role: "admin" | "coach" | "client";
  }>({
    name: "Admin User",
    email: "admin@thrivecircle.com",
    avatar: "https://i.pravatar.cc/150?img=1",
    role: "admin",
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleRoleSwitch = (role: "admin" | "coach" | "client") => {
    setUserRole(role);
    const roleUsers = {
      admin: {
        name: "Admin User",
        email: "admin@thrivecircle.com",
        avatar: "https://i.pravatar.cc/150?img=1",
        role: "admin" as const,
      },
      coach: {
        name: "Sarah Johnson",
        email: "sarah@thrivecircle.com",
        avatar: "https://i.pravatar.cc/150?img=2",
        role: "coach" as const,
      },
      client: {
        name: "John Smith",
        email: "john@thrivecircle.com",
        avatar: "https://i.pravatar.cc/150?img=3",
        role: "client" as const,
      },
    };
    setCurrentUser(roleUsers[role]);
    setUserMenuAnchor(null);
  };

  const handleDrawerCollapse = () => {
    setDrawerCollapsed(!drawerCollapsed);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Mock client data
  const mockClients = [
    { id: "client-1", name: "Acme Corporation", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: "client-2", name: "TechStart Inc", avatar: "https://i.pravatar.cc/150?img=2" },
    { id: "client-3", name: "Global Solutions", avatar: "https://i.pravatar.cc/150?img=3" },
    { id: "client-4", name: "Innovation Labs", avatar: "https://i.pravatar.cc/150?img=4" },
    { id: "client-5", name: "Future Dynamics", avatar: "https://i.pravatar.cc/150?img=5" },
  ];



  const drawer = (
    <Box>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Collapse in={!drawerCollapsed} orientation="horizontal">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img src={process.env.NODE_ENV === 'production' ? '/thrive-circle/logo.png' : '/logo.png'} alt="Logo" style={{ width: 40, height: 40 }} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ 
                color: "#FFFFFF", 
                fontWeight: "bold",
                textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                letterSpacing: "0.5px",
              }}
            >
              Thrive Circle
            </Typography>
          </Box>
        </Collapse>
        <IconButton 
          onClick={handleDrawerCollapse} 
          size="small"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              transform: 'scale(1.1)',
              boxShadow: '0 4px 12px rgba(255, 255, 255, 0.3)',
            },
            transition: 'all 0.2s ease',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          {drawerCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>
      <List>
        {navigationItems.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  minHeight: 48,
                  justifyContent: drawerCollapsed ? "center" : "flex-start",
                  background: isActive ? "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(139, 92, 246, 0.4) 100%)" : "transparent",
                  color: isActive ? "#FFFFFF" : "#FFFFFF",
                  "&:hover": {
                    background: isActive 
                      ? "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(139, 92, 246, 0.5) 100%)" 
                      : "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(139, 92, 246, 0.2) 100%)",
                    transform: "translateX(4px)",
                  },
                  transition: "all 0.2s ease",
                  "&.Mui-selected": {
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(139, 92, 246, 0.4) 100%)",
                    color: "#FFFFFF",
                    boxShadow: "0 2px 8px rgba(255, 255, 255, 0.2)",
                    "&:hover": {
                      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(139, 92, 246, 0.5) 100%)",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#FFFFFF" : "#FFFFFF",
                    minWidth: drawerCollapsed ? 0 : 40,
                    filter: isActive ? "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" : "none",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <Collapse in={!drawerCollapsed} orientation="horizontal">
                  <ListItemText primary={item.label} />
                </Collapse>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerCollapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          ml: { md: `${drawerCollapsed ? collapsedDrawerWidth : drawerWidth}px` },
          transition: "width 0.3s ease, margin-left 0.3s ease",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}>
            <img src={process.env.NODE_ENV === 'production' ? '/thrive-circle/logo.png' : '/logo.png'} alt="Logo" style={{ width: 36, height: 36 }} />
            
            {/* Client Selector */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                displayEmpty
                sx={{
                  color: "#FFFFFF",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                  "& .MuiSelect-icon": {
                    color: "rgba(255, 255, 255, 0.8)",
                  },
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 1,
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: "#FFFBFE",
                      border: "1px solid #E7E0EC",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                    },
                  },
                }}
                renderValue={(value) => {
                  if (!value) {
                    return (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "rgba(255, 255, 255, 0.7)" }}>
                        <BusinessIcon sx={{ fontSize: 20 }} />
                        <Typography>All Clients</Typography>
                      </Box>
                    );
                  }
                  const client = mockClients.find(c => c.id === value);
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar src={client?.avatar} sx={{ width: 20, height: 20 }} />
                      <Typography>{client?.name}</Typography>
                    </Box>
                  );
                }}
              >
                <MenuItem value="" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <BusinessIcon sx={{ color: "primary.main" }} />
                  <Typography>All Clients</Typography>
                </MenuItem>
                {mockClients.map((client) => (
                  <MenuItem key={client.id} value={client.id} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar src={client.avatar} sx={{ width: 24, height: 24, mr: 1 }} />
                    <Typography>{client.name}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* User Menu */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              label={userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              size="small"
              color="secondary"
            />
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="user-menu"
              aria-haspopup="true"
              onClick={handleUserMenuOpen}
              color="inherit"
            >
              <Avatar 
                src={currentUser.avatar} 
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ 
          width: { md: drawerCollapsed ? collapsedDrawerWidth : drawerWidth }, 
          flexShrink: { md: 0 },
          transition: "width 0.3s ease",
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerCollapsed ? collapsedDrawerWidth : drawerWidth,
              transition: "width 0.3s ease",
              overflowX: "hidden",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerCollapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          mt: "64px", // AppBar height
          transition: "width 0.3s ease",
          background: "linear-gradient(135deg, #F7F2FF 0%, #E7E0EC 50%, #F7F2FF 100%)",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Outlet />
      </Box>

      {/* User Menu */}
      <Menu
        id="user-menu"
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            minWidth: 250,
            mt: 1,
          },
        }}
      >
        {/* Current User Info */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar src={currentUser.avatar} sx={{ mr: 2, width: 40, height: 40 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {currentUser.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentUser.email}
              </Typography>
            </Box>
          </Box>
          <Chip 
            label={currentUser.role.toUpperCase()} 
            color="primary" 
            size="small"
            icon={currentUser.role === 'admin' ? <AdminIcon /> : currentUser.role === 'coach' ? <PsychologyIcon /> : <PersonIcon />}
          />
        </Box>

        {/* Role Switch Options */}
        <MenuItem onClick={() => handleRoleSwitch("admin")}>
          <ListItemIcon>
            <AdminIcon fontSize="small" />
          </ListItemIcon>
          <Box>
            <Typography variant="body1">Switch to Admin</Typography>
            <Typography variant="caption" color="text.secondary">
              Manage platform, users, and analytics
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleRoleSwitch("coach")}>
          <ListItemIcon>
            <PsychologyIcon fontSize="small" />
          </ListItemIcon>
          <Box>
            <Typography variant="body1">Switch to Coach</Typography>
            <Typography variant="caption" color="text.secondary">
              Create assessments, manage clients
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleRoleSwitch("client")}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <Box>
            <Typography variant="body1">Switch to Client</Typography>
            <Typography variant="caption" color="text.secondary">
              Book sessions, complete assessments
            </Typography>
          </Box>
        </MenuItem>

        <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1, pt: 1 }}>
          <MenuItem>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Profile Settings
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" />
            </ListItemIcon>
            Account
          </MenuItem>
        </Box>
      </Menu>
    </Box>
  );
};
