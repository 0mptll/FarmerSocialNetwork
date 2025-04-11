import React, { useEffect, useState } from 'react';
import { Card, Button, Dropdown, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import axiosInstance from '../services/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const CropResourceListComponent = () => {
    const { isLoggedIn, role, userId } = useAuth();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [category, setCategory] = useState('');
    const [userRating, setUserRating] = useState({});
    const [avgRatings, setAvgRatings] = useState({});
    const [sortOrder, setSortOrder] = useState('desc');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);

    useEffect(() => {
        fetchResources();
    }, [category, userId, sortOrder]);

    const fetchSpecialisms = async (resourceId) => {
        try {
            const response = await axiosInstance.get(`/api/crop-resources/${resourceId}`);
            const specializations = response.data.uploadedBy?.specializations || [];
            const uploaderId = response.data.uploadedBy?.id || null;
            const uploaderName = response.data.uploadedBy?.name || 'Unknown';
            
            return specializations.flatMap(spec => 
                spec.specialismTypes.map(type => ({ 
                    id: uploaderId, 
                    specialismType: type, 
                    name: uploaderName 
                }))
            ) || [];
        } catch (error) {
            console.error(`Error fetching specialisms for resource ${resourceId}:`, error);
            return [];
        }
    };

    const fetchResources = async () => {
        setLoading(true);
        const url = category
            ? `/api/crop-resources/category/${category}`
            : '/api/crop-resources';

        try {
            const response = await axiosInstance.get(url);
            let resourcesWithSpecialisms = await Promise.all(
                response.data.map(async (resource) => {
                    if (resource?.id) {
                        const specialisms = await fetchSpecialisms(resource.id);
                        const uploadDetails = await axiosInstance.get(`/api/crop-resources/upload/${resource.id}`);
                        
                        return {
                            ...resource,
                            uploadedBy: {
                                ...resource.uploadedBy,
                                name: uploadDetails.data.uploaderName || 'Unknown',
                                uploaderId: uploadDetails.data.uploaderId,
                                specializations: specialisms
                            }
                        };
                    }
                    return resource;
                })
            );

            await Promise.all(resourcesWithSpecialisms.map(resource => fetchAvgRating(resource.id)));
            
            resourcesWithSpecialisms.sort((a, b) => {
                const ratingA = avgRatings[a.id] === "N/A" ? -1 : parseFloat(avgRatings[a.id]);
                const ratingB = avgRatings[b.id] === "N/A" ? -1 : parseFloat(avgRatings[b.id]);

                return sortOrder === 'asc' 
                    ? ratingA - ratingB 
                    : ratingB - ratingA;
            });

            setResources(resourcesWithSpecialisms);
            setLoading(false);
        } catch (error) {
            setError(error.response
                ? `Error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`
                : 'Error: No response received from the server.'
            );
            setLoading(false);
        }
    };

    const fetchAvgRating = async (resourceId) => {
        try {
            const response = await axiosInstance.get(`/api/ratings/crop-resource/${resourceId}`);
            const avgRating = response.data.avgRating 
                ? parseFloat(response.data.avgRating).toFixed(2) 
                : "N/A";
            setAvgRatings(prev => ({ ...prev, [resourceId]: avgRating }));
        } catch (error) {
            console.error(`Error fetching average rating for resource ${resourceId}:`, error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/api/crop-resources/${id}?userId=${userId}`);
            setResources(prevResources => prevResources.filter(resource => resource.id !== id));
    
            Swal.fire({
                title: 'Success',
                text: 'Resource deleted successfully',
                icon: 'success',
                confirmButtonColor: '#3085d6',
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error.response?.data || 'Failed to delete the resource',
                icon: 'error',
                confirmButtonColor: '#3085d6',
            });
        }
    };

    const handleRatingChange = (cropResourceId, value) => {
        setUserRating(prev => ({
            ...prev,
            [cropResourceId]: value,
        }));
    };

    const submitRating = async (cropResourceId) => {
        const resource = resources.find(r => r.id === cropResourceId);
        const specialisms = resource.uploadedBy?.specializations || [];
        const firstSpecialismId = specialisms.length > 0 ? specialisms[0].id : null;

        try {
            await axiosInstance.post("/api/ratings", {
                cropResource: { id: cropResourceId },
                user: { id: userId },
                ratingValue: userRating[cropResourceId],
                ratedUser: { id: firstSpecialismId }
            });

            Swal.fire({
                title: 'Rating submitted successfully!',
                icon: 'success',
                confirmButtonColor: '#3085d6',
            });

            await fetchResources();
        } catch (error) {
            console.error("Error submitting rating:", error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to submit rating',
                icon: 'error',
                confirmButtonColor: '#3085d6',
            });
        }
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const openResourceDetails = (resource) => {
        setSelectedResource(resource);
        setShowDetailModal(true);
    };

    return (
        <div className="container-fluid p-4 bg-light">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="text-success">
                            <i className="bi bi-flower1 me-2"></i>Crop Resource Explorer
                        </h2>
                        <div className="d-flex">
                            <Dropdown className="me-2">
                                <Dropdown.Toggle variant="outline-success" id="category-dropdown">
                                    {category || 'Select Category'}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => setCategory('')}>All Categories</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setCategory('Winter')}>Winter</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setCategory('Summer')}>Summer</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setCategory('Monsoon')}>Monsoon</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <Button 
                                variant="outline-primary" 
                                onClick={toggleSortOrder}
                            >
                                <i className="bi bi-sort-up me-1"></i>
                                Rating {sortOrder === 'asc' ? '▲' : '▼'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="success" />
                    <p>Loading resources...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Resources Grid */}
            <div className="row row-cols-1 row-cols-md-3 g-4">
                {!loading && resources.length === 0 && (
                    <div className="col-12">
                        <div className="alert alert-info text-center" role="alert">
                            No resources available in this category.
                        </div>
                    </div>
                )}

                {!loading && resources.map((resource) => (
                    <div key={resource.id} className="col">
                        <Card className="h-100 shadow-sm">
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <h5 className="card-title mb-0">{resource.title}</h5>
                                {(role === 'admin' || (role === 'agronomist' && resource.uploadedBy?.uploaderId === userId)) && (
                                    <Button 
                                        variant="danger" 
                                        size="sm" 
                                        onClick={() => handleDelete(resource.id)}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </Button>
                                )}
                            </Card.Header>
                            <Card.Body onClick={() => openResourceDetails(resource)}>
                                <p className="card-text">{resource.description}</p>
                                <Badge bg="success" className="me-2">{resource.category}</Badge>
                            </Card.Body>
                            <Card.Footer>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>Avg Rating:</strong>{' '}
                                        <Badge bg="warning" text="dark">
                                            {avgRatings[resource.id] ?? "N/A"}
                                        </Badge>
                                    </div>
                                    <div className="rating-stars">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                className={`star ${star <= (userRating[resource.id] || 0) ? 'text-warning' : 'text-muted'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRatingChange(resource.id, star);
                                                }}
                                                style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between mt-2">
                                    <Button 
                                        variant="outline-success" 
                                        size="sm" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            submitRating(resource.id);
                                        }}
                                    >
                                        Submit Rating
                                    </Button>
                                    <small className="text-muted">
                                        By: {resource.uploadedBy?.name || 'Unknown'}
                                    </small>
                                </div>
                            </Card.Footer>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Resource Details Modal */}
            <Modal 
                show={showDetailModal} 
                onHide={() => setShowDetailModal(false)}
                size="lg"
            >
                {selectedResource && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>{selectedResource.title}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-md-8">
                                    <h5>Description</h5>
                                    <p>{selectedResource.description}</p>
                                    
                                    <h5 className="mt-3">Details</h5>
                                    <ul className="list-unstyled">
                                        <li><strong>Category:</strong> {selectedResource.category}</li>
                                        <li>
                                            <strong>Specialisms:</strong>{' '}
                                            {selectedResource.uploadedBy?.specializations?.map(s => s.specialismType).join(', ') || 'N/A'}
                                        </li>
                                        <li><strong>Average Rating:</strong> {avgRatings[selectedResource.id] ?? "N/A"}</li>
                                    </ul>
                                </div>
                                <div className="col-md-4">
                                    <h5>Uploader Information</h5>
                                    <div className="card">
                                        <div className="card-body">
                                            <h6 className="card-subtitle mb-2 text-muted">
                                                {selectedResource.uploadedBy?.name || 'Unknown'}
                                            </h6>
                                            <p className="card-text small">
                                                Uploaded resources in various agricultural domains
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default CropResourceListComponent;