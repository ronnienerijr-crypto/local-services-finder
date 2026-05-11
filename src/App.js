import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useLocation, useParams } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  CardActionArea,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Chip,
  Tooltip,
  Rating,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import HomeIcon from '@mui/icons-material/Home';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import PrintIcon from '@mui/icons-material/Print';
import HotelIcon from '@mui/icons-material/Hotel';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import StoreIcon from '@mui/icons-material/Store';
import BuildIcon from '@mui/icons-material/Build';
import ComputerIcon from '@mui/icons-material/Computer';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import services from './servicesData';
import ServiceDetails from './ServiceDetails';
import './App.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const drawerWidth = 240;
const categoryHeaderIds = new Set([
  'laundry',
  'printing',
  'boarding-house',
  'food-delivery',
  'pharmacy',
  'grocery',
  'repair-services',
  'internet-cafe',
]);

const categoryTabs = [
  { id: 'laundry', label: 'Laundry', match: (service) => service.category === 'Home', icon: LocalLaundryServiceIcon },
  { id: 'printing', label: 'Printing', match: (service) => service.category === 'Office', icon: PrintIcon },
  { id: 'boarding-house', label: 'Boarding House', match: (service) => service.category === 'Boarding House', icon: HotelIcon },
  { id: 'food-delivery', label: 'Food Delivery', match: (service) => service.category === 'Food', icon: FastfoodIcon },
  { id: 'pharmacy', label: 'Pharmacy', match: (service) => service.category === 'Health', icon: LocalPharmacyIcon },
  { id: 'grocery', label: 'Grocery', match: (service) => service.category === 'Shopping', icon: StoreIcon },
  { id: 'repair-services', label: 'Repair Services', match: (service) => service.category === 'Repair', icon: BuildIcon },
  { id: 'internet-cafe', label: 'Internet Cafe', match: (service) => service.category === 'Internet', icon: ComputerIcon },
];

function Home() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [category, setCategory] = React.useState(categoryId || 'all');
  const [favorites, setFavorites] = React.useState(() => {
    try {
      const stored = window.localStorage.getItem('favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    window.localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  React.useEffect(() => {
    setCategory(categoryId || 'all');
  }, [categoryId]);

  const isFavorite = (id) => favorites.includes(id);
  const selectedCategory = categoryTabs.find((tab) => tab.id === category);
  const activeCategoryHeader = category === 'all' ? null : services.find((service) => service.id === category);

  const filteredServices = services.filter((service) => {
    if (categoryHeaderIds.has(service.id)) {
      return false;
    }

    const matchesCategory = category === 'all' || (selectedCategory && selectedCategory.match(service));
    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const displayedServices = [...filteredServices].sort((a, b) => {
    const favoriteDelta = Number(isFavorite(b.id)) - Number(isFavorite(a.id));
    if (favoriteDelta !== 0) {
      return favoriteDelta;
    }
    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
  });

  const getAverageRating = (serviceId) => {
    try {
      const stored = window.localStorage.getItem('serviceDetailEngagement');
      const parsed = stored ? JSON.parse(stored) : {};
      const reviews = Array.isArray(parsed?.[serviceId]?.reviews) ? parsed[serviceId].reviews : [];

      if (reviews.length === 0) {
        return null;
      }

      return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    } catch {
      return null;
    }
  };

  const getCategoryTagline = (title, description) => {
    if (title === 'Laundry') return 'Quick and affordable local laundry services nearby';
    if (title === 'Printing') return 'Fast document printing and copying services close by';
    if (title === 'Boarding House') return 'Comfortable and affordable stays near campus and town';
    if (title === 'Food Delivery') return 'Local food spots ready for quick delivery and pickup';
    if (title === 'Pharmacy') return 'Medicines and healthcare essentials within easy reach';
    if (title === 'Grocery') return 'Daily essentials, fresh produce, and household items nearby';
    if (title === 'Repair Services') return 'Tool and gadget repair specialists nearby';
    if (title === 'Internet Cafe') return 'Online access, printing, and workspace when you need it';
    return description;
  };

  const listAreaSx = {
    width: '100%',
    maxWidth: { xs: '100%', md: '984px' },
    mr: 'auto',
  };

  const renderCategoryHeader = (service) => {
    if (!service) {
      return null;
    }

    return (
      <Box
        sx={{
          ...listAreaSx,
          mb: 3,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          minHeight: 220,
          backgroundImage: `url(${service.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: 3,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(0, 0, 0, 0.55)',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            minHeight: 220,
            px: { xs: 3, sm: 4 },
            py: { xs: 3, sm: 4 },
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <Box sx={{ maxWidth: 720 }}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 800, color: 'common.white', mb: 1 }}>
              {service.title}
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.88)', fontWeight: 400 }}>
              {getCategoryTagline(service.title, service.description)}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Container sx={{ mt: 10, mb: 4 }}>
      <Box component="section" mb={2} sx={{ ...listAreaSx, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Search services"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for laundry, printing, boarding houses..."
        />
      </Box>

      <Box component="section" mb={3} display="flex" alignItems="center" gap={1} flexWrap="wrap">
        {[{ id: 'all', label: 'All Services' }, ...categoryTabs].map((cat) => (
          <Chip
            key={cat.id}
            label={cat.label}
            clickable
            onClick={() => {
              const route = cat.id === 'all' ? '/' : `/category/${cat.id}`;
              navigate(route);
            }}
            sx={{
              bgcolor: category === cat.id ? 'grey.300' : 'grey.100',
              '&:hover': {
                bgcolor: category === cat.id ? 'grey.300' : 'grey.200',
              },
            }}
          />
        ))}
      </Box>

      {activeCategoryHeader && renderCategoryHeader(activeCategoryHeader)}

      <Grid container spacing={3}>
        {displayedServices.map((service) => {
          const averageRating = getAverageRating(service.id);

          return (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              <Card sx={{ position: 'relative', width: 300, height: 350, display: 'flex', flexDirection: 'column' }} elevation={3}>
                <CardActionArea onClick={() => navigate(`/services/${service.id}`)} sx={{ flexGrow: 1 }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={service.image}
                    alt={service.title}
                    sx={{ objectFit: 'cover', width: '100%' }}
                    onError={(event) => {
                      event.target.onerror = null;
                      event.target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <CardContent sx={{ minHeight: 120, maxHeight: 120, overflow: 'hidden' }}>
                    <Typography 
                      gutterBottom 
                      variant="h6" 
                      component="div" 
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={service.title}
                    >
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap title={service.description}>
                      {service.description}
                    </Typography>
                    <Box mt={1} display="flex" alignItems="center" gap={1}>
                      {averageRating !== null ? (
                        <>
                          <Rating value={averageRating} precision={0.1} readOnly size="small" />
                          <Typography variant="caption" color="text.secondary">
                            {averageRating.toFixed(1)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No rating yet
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                  <Button size="small" onClick={() => navigate(`/services/${service.id}`)}>
                    VIEW DETAILS
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Box component="section" mt={6} sx={{ height: 460 }}>
        <Typography variant="h5" gutterBottom>
          Iligan City Map
        </Typography>
        <MapContainer center={[8.228, 124.245]} zoom={13} style={{ height: '380px', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {displayedServices.map((service) => (
            <Marker key={service.id} position={service.coords}>
              <Popup>
                <Typography variant="subtitle2" fontWeight="bold">
                  {service.title}
                </Typography>
                {service.description}
                <br />
                <Typography variant="caption">{service.distance}</Typography>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Container>
  );
}

function AppLayout() {
  const [drawerOpen, setDrawerOpen] = React.useState(true);
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex' }}>
        <CssBaseline />

        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen((open) => !open)}
              sx={{ mr: 2 }}
            >
              {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              NovaForge LocalLink
            </Typography>
            <IconButton color="inherit" component={Link} to="/">
              <HomeIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              <ListItemButton
                component={Link}
                to="/"
                onClick={() => setDrawerOpen(true)}
                selected={location.pathname === '/'}
                sx={{
                  bgcolor: location.pathname === '/' ? 'grey.300' : 'transparent',
                  '&:hover': {
                    bgcolor: location.pathname === '/' ? 'grey.300' : 'grey.100',
                  },
                }}
              >
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="All Services" />
              </ListItemButton>
              <Divider />
              {categoryTabs.map((tab) => {
                const servicePath = `/category/${tab.id}`;
                const isActive = location.pathname === servicePath;
                const Icon = tab.icon;
                return (
                  <ListItemButton
                    key={tab.id}
                    component={Link}
                    to={servicePath}
                    selected={isActive}
                    sx={{
                      bgcolor: isActive ? 'grey.300' : 'transparent',
                      '&:hover': {
                        bgcolor: isActive ? 'grey.300' : 'grey.100',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Icon />
                    </ListItemIcon>
                    <ListItemText primary={tab.label} />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        </Drawer>

        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, marginLeft: drawerOpen ? `${drawerWidth}px` : 0 }}
        >
          <Toolbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:categoryId" element={<Home />} />
            <Route path="/services/:id" element={<ServiceDetails />} />
          </Routes>
        </Box>
      </Box>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;