import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, CardMedia, Typography, Button, Container, Rating, TextField, IconButton, Divider } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import services from './servicesData';

const serviceInfo = {
  laundry: {
    location: 'Vicente Sheker Street, Iligan City',
    availability: 'Open daily',
    openTime: '8:00 AM',
    closeTime: '8:00 PM',
    offers: ['Same-day wash and fold', 'Student discount bundles', 'Pickup assistance nearby'],
    menu: ['Wash and fold', 'Dry cleaning', 'Blanket and comforter cleaning'],
  },
  printing: {
    location: 'Near major school supplies district, Iligan City',
    availability: 'Open daily',
    openTime: '7:30 AM',
    closeTime: '7:00 PM',
    offers: ['Bulk printing discount', 'Express print queue', 'Document layout assistance'],
    menu: ['Black and white printing', 'Colored printing', 'Photocopy and binding'],
  },
  'boarding-house': {
    location: 'Central accommodation zone, Iligan City',
    availability: 'Available slots vary weekly',
    openTime: '9:00 AM',
    closeTime: '6:00 PM',
    offers: ['Monthly rental plans', 'Security and maintenance support', 'Utility-inclusive options'],
    menu: ['Single bed spaces', 'Shared rooms', 'Private room options'],
  },
  'penny-boarding-house': {
    location: 'Near school and market access points, Iligan City',
    availability: 'Limited slots available',
    openTime: '9:00 AM',
    closeTime: '7:00 PM',
    offers: ['Flexible monthly terms', 'Wi-Fi ready rooms', 'Water and electricity packages'],
    menu: ['Single occupancy room', 'Shared occupancy room', 'Bedspace package'],
  },
  'sunny-dorm': {
    location: 'Town-access dorm strip, Iligan City',
    availability: 'Available this month',
    openTime: '8:00 AM',
    closeTime: '6:00 PM',
    offers: ['Student-focused rates', 'Quiet study hours', 'Laundry area access'],
    menu: ['Dorm bedspace', 'Shared dorm room', 'Short-stay arrangement'],
  },
  'riverside-lodge': {
    location: 'Riverside corridor, Iligan City',
    availability: 'Open for inquiry daily',
    openTime: '8:00 AM',
    closeTime: '8:00 PM',
    offers: ['Scenic room options', 'Extended-stay discounts', 'Basic housekeeping'],
    menu: ['Budget room', 'Standard room', 'Extended-stay room package'],
  },
  'amirah-dormitory': {
    location: 'Central district access road, Iligan City',
    availability: 'Slots rotate every term',
    openTime: '8:30 AM',
    closeTime: '6:30 PM',
    offers: ['Secure entry policy', 'Common kitchen access', 'Utility support'],
    menu: ['Female dorm room', 'Shared room option', 'Study-friendly unit'],
  },
  'jr-boys-boarding-house': {
    location: 'Worker and student residential area, Iligan City',
    availability: 'Inquiry-based availability',
    openTime: '9:00 AM',
    closeTime: '7:00 PM',
    offers: ['Budget monthly rates', 'Group roommate setup', 'Maintenance support'],
    menu: ['Bedspace option', 'Shared room package', 'Monthly rental room'],
  },
  'food-delivery': {
    location: 'Citywide local partner restaurants, Iligan City',
    availability: 'Open daily',
    openTime: '9:00 AM',
    closeTime: '11:00 PM',
    offers: ['Free delivery on minimum spend', 'Combo meal deals', 'Cashless payment support'],
    menu: ['Rice meals', 'Noodles and soups', 'Drinks and desserts'],
  },
  pharmacy: {
    location: 'Health and medicine district, Iligan City',
    availability: 'Open daily',
    openTime: '7:00 AM',
    closeTime: '10:00 PM',
    offers: ['Essential medicine stock', 'Prescription assistance', 'Health basics bundle'],
    menu: ['Prescription medicine', 'Over-the-counter medicine', 'Vitamins and supplements'],
  },
  grocery: {
    location: 'Neighborhood market and retail strip, Iligan City',
    availability: 'Open daily',
    openTime: '6:00 AM',
    closeTime: '9:00 PM',
    offers: ['Fresh produce restock daily', 'Family basket bundles', 'Local delivery options'],
    menu: ['Fresh produce', 'Dry goods', 'Household essentials'],
  },
  'repair-services': {
    location: 'Repair and maintenance corridor, Iligan City',
    availability: 'Open Monday to Saturday',
    openTime: '8:00 AM',
    closeTime: '6:00 PM',
    offers: ['Diagnostic checkup', 'Same-day repair for common issues', 'Service warranty options'],
    menu: ['Phone repair', 'Laptop repair', 'Appliance maintenance'],
  },
  'internet-cafe': {
    location: 'Commercial and school-adjacent zone, Iligan City',
    availability: 'Open daily',
    openTime: '9:00 AM',
    closeTime: '12:00 AM',
    offers: ['Hourly package rates', 'Gaming station bundles', 'Printing and scanning support'],
    menu: ['Internet browsing', 'Gaming sessions', 'Printing and document access'],
  },
};

function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const service = services.find((item) => item.id === id);
  const serviceDefaults = React.useMemo(() => service || {
    rating: 0,
    likes: 0,
    reviews: [],
    comments: [],
  }, [service]);
  const details = serviceInfo[id] || {
    location: 'Local area service point',
    availability: 'Please contact for availability',
    openTime: '8:00 AM',
    closeTime: '5:00 PM',
    offers: ['Inquire for current promotions'],
    menu: ['General service options'],
  };
  const mapRef = React.useRef(null);
  const [routeControl, setRouteControl] = React.useState(null);
  const [routingError, setRoutingError] = React.useState(null);
  const [reviewRating, setReviewRating] = React.useState(0);
  const [commentText, setCommentText] = React.useState('');
  const loadEngagement = React.useCallback((serviceId) => {
    try {
      const stored = window.localStorage.getItem('serviceDetailEngagement');
      const parsed = stored ? JSON.parse(stored) : {};
      const storedService = parsed[serviceId] || {};

      return {
        likes: typeof storedService.likes === 'number' ? storedService.likes : serviceDefaults.likes,
        reviews: Array.isArray(storedService.reviews) ? storedService.reviews : serviceDefaults.reviews,
        comments: Array.isArray(storedService.comments) ? storedService.comments : serviceDefaults.comments,
      };
    } catch {
      return {
        likes: serviceDefaults.likes,
        reviews: serviceDefaults.reviews,
        comments: serviceDefaults.comments,
      };
    }
  }, [serviceDefaults]);
  const [engagement, setEngagement] = React.useState(() => loadEngagement(id));

  React.useEffect(() => {
    setEngagement(loadEngagement(id));
    setReviewRating(0);
    setCommentText('');
  }, [id, loadEngagement]);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem('serviceDetailEngagement');
      const parsed = stored ? JSON.parse(stored) : {};
      parsed[id] = engagement;
      window.localStorage.setItem('serviceDetailEngagement', JSON.stringify(parsed));
    } catch {
      window.localStorage.setItem('serviceDetailEngagement', JSON.stringify({ [id]: engagement }));
    }
  }, [engagement, id]);

  const averageRating = engagement.reviews.length > 0
    ? engagement.reviews.reduce((sum, review) => sum + review.rating, 0) / engagement.reviews.length
    : serviceDefaults.rating;

  const handleLike = () => {
    setEngagement((current) => ({
      ...current,
      likes: current.likes + 1,
    }));
  };

  const handleSubmitReview = () => {
    if (!reviewRating) {
      return;
    }

    setEngagement((current) => ({
      ...current,
      reviews: [...current.reviews, { userId: 'guest', rating: reviewRating, comment: '' }],
    }));
    setReviewRating(0);
  };

  const handleSubmitComment = () => {
    const text = commentText.trim();
    if (!text) {
      return;
    }

    setEngagement((current) => ({
      ...current,
      comments: [...current.comments, { userId: 'guest', text, timestamp: new Date().toISOString() }],
    }));
    setCommentText('');
  };

  if (!service) {
    return (
      <Container sx={{ mt: 10 }}>
        <Typography variant="h4" gutterBottom>
          Service not found
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>Go back</Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 10, mb: 4 }}>
      <Card elevation={6} sx={{ maxWidth: 900, mx: 'auto' }}>
        <CardMedia component="img" height="320" image={service.image} alt={service.title} />
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {service.title}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <IconButton onClick={handleLike} sx={{ color: engagement.likes > 0 ? 'error.main' : 'text.secondary' }}>
              {engagement.likes > 0 ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {engagement.likes} Likes
            </Typography>
          </Box>
          <Typography variant="subtitle1" gutterBottom>
            Category: {service.category}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Rating value={averageRating} precision={0.1} readOnly />
            <Typography variant="body2" color="text.secondary">
              {averageRating.toFixed(1)} / 5.0
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            {service.description}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Distance: {service.distance}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Coordinates: {service.coords[0]}, {service.coords[1]}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Location: {details.location}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Availability: {details.availability}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Open: {details.openTime}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Close: {details.closeTime}
          </Typography>
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>
              Offers
            </Typography>
            {details.offers.map((offer) => (
              <Typography key={offer} variant="body2" color="text.secondary">
                - {offer}
              </Typography>
            ))}
          </Box>
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>
              Menu / Services
            </Typography>
            {details.menu.map((item) => (
              <Typography key={item} variant="body2" color="text.secondary">
                - {item}
              </Typography>
            ))}
          </Box>
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Location Map
            </Typography>
            <Box sx={{ height: 320 }}>
              <MapContainer
                center={service.coords}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                whenCreated={(mapInstance) => {
                  mapRef.current = mapInstance;
                }}
              >
                <TileLayer
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={service.coords}>
                  <Popup>
                    <div style={{ color: '#000', maxWidth: 240 }}>
                      <strong>{service.title}</strong>
                      <p style={{ margin: '6px 0' }}>{service.description}</p>
                      <small>{service.distance}</small>
                      <div style={{ marginTop: 8 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={async () => {
                            setRoutingError(null);
                            try {
                              let origin = null;
                              // try geolocation
                              origin = await new Promise((resolve) => {
                                if (!navigator.geolocation) return resolve(null);
                                navigator.geolocation.getCurrentPosition(
                                  (pos) => {
                                    resolve([pos.coords.latitude, pos.coords.longitude]);
                                  },
                                  () => resolve(null),
                                  { timeout: 5000 }
                                );
                              });
                              if (!origin) {
                                // fallback: use a point offset from destination
                                origin = [service.coords[0] - 0.002, service.coords[1] - 0.002];
                              }

                              // remove existing route
                              if (routeControl && mapRef.current) {
                                routeControl.remove();
                                setRouteControl(null);
                              }

                              if (!mapRef.current || !L.Routing) {
                                setRoutingError('Routing engine not available');
                                return;
                              }

                              const control = L.Routing.control({
                                waypoints: [L.latLng(origin[0], origin[1]), L.latLng(service.coords[0], service.coords[1])],
                                routeWhileDragging: false,
                                showAlternatives: false,
                                lineOptions: { styles: [{ color: '#1976d2', opacity: 0.8, weight: 6 }] },
                                createMarker: function() { return null; },
                              }).addTo(mapRef.current);

                              setRouteControl(control);
                            } catch (err) {
                              setRoutingError('Could not calculate route');
                            }
                          }}
                        >
                          Get directions in-app
                        </Button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
              {routingError && (
                <Typography color="error" variant="body2">{routingError}</Typography>
              )}
            </Box>
          </Box>
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Reviews
            </Typography>
            {engagement.reviews.length > 0 ? (
              engagement.reviews.map((review, index) => (
                <Box key={`${review.userId}-${index}`} sx={{ mb: 1.5 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Rating value={review.rating} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      {review.rating} / 5
                    </Typography>
                  </Box>
                  {review.comment ? (
                    <Typography variant="body2">{review.comment}</Typography>
                  ) : null}
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No reviews yet.
              </Typography>
            )}
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Submit a review
              </Typography>
              <Rating value={reviewRating} onChange={(_, value) => setReviewRating(value ?? 0)} />
              <Box mt={1}>
                <Button variant="contained" onClick={handleSubmitReview}>
                  Submit Review
                </Button>
              </Box>
            </Box>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Box>
            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>
            {engagement.comments.length > 0 ? (
              engagement.comments.slice().reverse().map((comment, index) => (
                <Box key={`${comment.timestamp}-${index}`} sx={{ mb: 1.5, p: 1.5, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2">{comment.text}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No comments yet.
              </Typography>
            )}
            <Box mt={2}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Add a comment"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
              />
              <Box mt={1}>
                <Button variant="contained" onClick={handleSubmitComment}>
                  Post Comment
                </Button>
              </Box>
            </Box>
          </Box>
          <Box mt={3}>
            <Button variant="contained" onClick={() => navigate(-1)}>
              Back
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default ServiceDetails;
