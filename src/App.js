import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
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
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import HotelIcon from '@mui/icons-material/Hotel';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import StoreIcon from '@mui/icons-material/Store';
import BuildIcon from '@mui/icons-material/Build';
import ComputerIcon from '@mui/icons-material/Computer';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
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

function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [category, setCategory] = React.useState('All');
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

  const categories = ['All', 'Home', 'Office', 'Accommodation', 'Food', 'Health', 'Shopping', 'Repair', 'Internet'];

  const filteredServices = services.filter((service) => {
    const matchesCategory = category === 'All' || service.category === category;
    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isFavorite = (id) => favorites.includes(id);

  const toggleFavorite = (id) => {
    setFavorites((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      return [...current, id];
    });
  };

  return (
    <Container sx={{ mt: 10, mb: 4 }}>
      <Box component="section" mb={2} display="flex" alignItems="center" gap={2} flexWrap="wrap">
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
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            clickable
            color={category === cat ? 'primary' : 'default'}
            onClick={() => setCategory(cat)}
          />
        ))}
      </Box>

      <Grid container spacing={3}>
        {filteredServices.map((service) => (
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
                  <Box display="flex" alignItems="center" justifyContent="space-between"> 
                    <Typography gutterBottom variant="h6" component="div">
                      {service.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(service.id);
                      }}
                    >
                      {isFavorite(service.id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {service.description}
                  </Typography>
                  <Box mt={1} display="flex" alignItems="center" gap={1}>
                    <Rating value={service.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary">
                      {service.rating.toFixed(1)}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Button size="small" onClick={() => navigate(`/services/${service.id}`)}>
                  View Details
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                  {service.distance}
                </Typography>
              </CardActions>
            </Card>
          </Grid>
        ))}
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
          {filteredServices.map((service) => (
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

function App() {
  const [drawerOpen, setDrawerOpen] = React.useState(true);

  return (
    <Router>
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
              <ListItemButton component={Link} to="/" onClick={() => setDrawerOpen(true)}>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="All Services" />
              </ListItemButton>
              <Divider />
              {services.map((service) => {
                let Icon;
                switch (service.id) {
                  case 'laundry':
                    Icon = LocalLaundryServiceIcon;
                    break;
                  case 'printing':
                    Icon = PrintIcon;
                    break;
                  case 'boarding-house':
                    Icon = HotelIcon;
                    break;
                  case 'food-delivery':
                    Icon = FastfoodIcon;
                    break;
                  case 'pharmacy':
                    Icon = LocalPharmacyIcon;
                    break;
                  case 'grocery':
                    Icon = StoreIcon;
                    break;
                  case 'repair-services':
                    Icon = BuildIcon;
                    break;
                  case 'internet-cafe':
                    Icon = ComputerIcon;
                    break;
                  default:
                    Icon = HomeIcon;
                }
                return (
                  <ListItemButton
                    key={service.id}
                    component={Link}
                    to={`/services/${service.id}`}
                  >
                    <ListItemIcon>
                      <Icon />
                    </ListItemIcon>
                    <ListItemText primary={service.title} />
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
            <Route path="/services/:id" element={<ServiceDetails />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
