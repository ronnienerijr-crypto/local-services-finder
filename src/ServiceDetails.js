import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, CardMedia, Typography, Button, Container, Rating } from '@mui/material';
import services from './servicesData';

function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const service = services.find((item) => item.id === id);

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
          <Typography variant="subtitle1" gutterBottom>
            Category: {service.category}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Rating value={service.rating} precision={0.1} readOnly />
            <Typography variant="body2" color="text.secondary">
              {service.rating.toFixed(1)} / 5.0
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            {service.description}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Distance: {service.distance}
          </Typography>
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
