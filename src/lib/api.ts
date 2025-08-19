// API service for LogiScore backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://logiscorebe.onrender.com';

export interface FreightForwarder {
  id: string;
  name: string;
  website?: string | null;
  logo_url?: string | null;
  description?: string | null;
  headquarters_country?: string | null;
  global_rank?: number | null;
  is_active?: boolean | null;
  rating?: number | null;
  average_rating?: number | null; // Calculated average rating from all reviews
  review_count?: number | null;
  weighted_review_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  category_scores?: Array<{
    category_name: string;
    average_score: number;
    review_count: number;
  }> | null;
}

// Legacy Review interface (for backward compatibility)
export interface Review {
  id: string;
  freight_forwarder_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

// New comprehensive review interfaces
export interface ReviewQuestion {
  id: string;
  text: string;
  ratingDefinitions: Record<string, string>;
  rating?: number; // Optional rating property for user input
}

export interface ReviewCategory {
  id: string;
  name: string;
  questions: ReviewQuestion[];
}

export interface FreightForwarderCreate {
  name: string;
  website?: string;
  description?: string;
}

export interface Location {
  id: string;
  name: string;
  city?: string;
  state?: string;
  region: string;
  subregion: string;
  country: string;
}

export interface QuestionRating {
  question: string;
  rating: number;
}

export interface CategoryRating {
  category: string;
  questions: QuestionRating[];
}

export interface ReviewCreate {
  freight_forwarder_id: string;
  location_id: string; // Changed from branch_id to location_id
  is_anonymous: boolean;
  review_weight: number;
  category_ratings: CategoryRating[];
  aggregate_rating: number;
  weighted_rating: number;
}

export interface ReviewResponse {
  id: string;
  freight_forwarder_id: string;
  location_id?: string; // Changed from branch_id to location_id
  is_anonymous: boolean;
  review_weight: number;
  aggregate_rating: number;
  weighted_rating: number;
  total_questions_rated: number;
  created_at: string;
}

export interface User {
  id: string;
  github_id?: string;
  username: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  company_name?: string;
  user_type: string;
  subscription_tier: string;
  is_verified: boolean;
  is_active: boolean;
  created_at?: string;
}

// API client class
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Debug: Log the full request details
    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body
    });
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        mode: 'cors',
        credentials: 'omit',
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        
        // Debug: Log the error response
        console.log('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Handle specific status codes
        if (response.status === 500) {
          // Check if the error text contains authentication errors
          if (errorText.includes('401') || errorText.includes('Invalid email or password')) {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          }
          if (errorText.includes('duplicate key') || errorText.includes('already exists')) {
            throw new Error('A user with this email or username already exists. Please try signing in instead.');
          }
          throw new Error('Server error. Please try again later.');
        }
        
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Debug: Log successful response
      console.log('API Success Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request<{
      status: string;
      database: string;
      timestamp: string;
    }>('/health');
  }

  // Freight forwarders
  async getFreightForwarders(limit?: number, randomSelect: boolean = false): Promise<FreightForwarder[]> {
    try {
      const params = new URLSearchParams();
      if (limit) {
        params.append('limit', limit.toString());
      }
      if (randomSelect) {
        params.append('random_select', 'true');
      }
      
      const queryString = params.toString();
      const endpoint = `/api/freight-forwarders/${queryString ? '?' + queryString : ''}`;
      
      // Add cache-busting headers to ensure fresh rating data
      return await this.request<FreightForwarder[]>(endpoint, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    } catch (error: any) {
      console.error('Failed to fetch freight forwarders:', error);
      throw error;
    }
  }

  async getFreightForwarder(id: string): Promise<any> {
    try {
      // Add cache-busting headers to ensure fresh rating data
      return await this.request<any>(`/api/freight-forwarders/${id}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    } catch (error: any) {
      console.error('Failed to fetch freight forwarder details:', error);
      throw error;
    }
  }

  async createFreightForwarder(forwarderData: FreightForwarderCreate, token: string): Promise<FreightForwarder> {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }
      
      // Debug: Log request details
      console.log('API Request Details:', {
        url: '/api/freight-forwarders/',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.substring(0, 20)}...`,
          'Content-Type': 'application/json'
        },
        body: forwarderData
      });
      
      return await this.request<FreightForwarder>('/api/freight-forwarders/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(forwarderData),
      });
    } catch (error: any) {
      console.error('Failed to create freight forwarder:', error);
      throw error;
    }
  }

  async createBranch(branchData: {
    freight_forwarder_id: string;
    name: string;
    country?: string;
    city?: string;
    address?: string;
    is_active?: boolean;
  }, token: string): Promise<{ id: string; name: string; freight_forwarder_id: string }> {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }
      
      // Debug: Log request details
      console.log('API Request Details:', {
        url: '/api/branches/',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.substring(0, 20)}...`,
          'Content-Type': 'application/json'
        },
        body: branchData
      });
      
      return await this.request<{ id: string; name: string; freight_forwarder_id: string }>('/api/branches/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(branchData),
      });
    } catch (error: any) {
      console.error('Failed to create branch:', error);
      throw error;
    }
  }

  async getBranchesByFreightForwarder(freightForwarderId: string): Promise<{ id: string; name: string; freight_forwarder_id: string; city?: string; country?: string }[]> {
    try {
      return await this.request<{ id: string; name: string; freight_forwarder_id: string; city?: string; country?: string }[]>(`/api/branches/?freight_forwarder_id=${freightForwarderId}`);
    } catch (error: any) {
      console.error('Failed to fetch branches for freight forwarder:', error);
      return [];
    }
  }

  async getLocations(): Promise<Location[]> {
    try {
      return await this.request<Location[]>('/api/locations');
    } catch (error: any) {
      console.error('Failed to fetch locations:', error);
      // Return fallback locations if API fails
      return this.getFallbackLocations();
    }
  }

  async getFreightForwarderLocationScores(freightForwarderId: string, token: string): Promise<Array<{
    location_id: string;
    location_name: string;
    country: string;
    city?: string;
    aggregate_score: number;
    review_count: number;
    category_scores: Array<{
      category_name: string;
      average_score: number;
      review_count: number;
    }>;
  }>> {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }
      
      return await this.request<Array<{
        location_id: string;
        location_name: string;
        country: string;
        city?: string;
        aggregate_score: number;
        review_count: number;
        category_scores: Array<{
          category_name: string;
          average_score: number;
          review_count: number;
        }>;
      }>>(`/api/freight-forwarders/${freightForwarderId}/location-scores`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      console.error('Failed to fetch location scores:', error);
      return [];
    }
  }

  async getFreightForwarderCountryScores(freightForwarderId: string, token: string): Promise<Array<{
    country: string;
    aggregate_score: number;
    review_count: number;
    location_count: number;
    category_scores: Array<{
      category_name: string;
      average_score: number;
      review_count: number;
    }>;
  }>> {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }
      
      return await this.request<Array<{
        country: string;
        aggregate_score: number;
        review_count: number;
        location_count: number;
        category_scores: Array<{
          category_name: string;
          average_score: number;
          review_count: number;
        }>;
      }>>(`/api/freight-forwarders/${freightForwarderId}/country-scores`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      console.error('Failed to fetch country scores:', error);
      return [];
    }
  }

  private getFallbackLocations(): Location[] {
    return [
      { id: 'us-east', name: 'New York', region: 'Americas', subregion: 'North America', country: 'USA' },
      { id: 'us-west', name: 'Los Angeles', region: 'Americas', subregion: 'North America', country: 'USA' },
      { id: 'uk-london', name: 'London', region: 'Europe', subregion: 'Western Europe', country: 'UK' },
      { id: 'de-hamburg', name: 'Hamburg', region: 'Europe', subregion: 'Central Europe', country: 'Germany' },
      { id: 'cn-shanghai', name: 'Shanghai', region: 'Asia', subregion: 'East Asia', country: 'China' },
      { id: 'sg-singapore', name: 'Singapore', region: 'Asia', subregion: 'Southeast Asia', country: 'Singapore' },
      { id: 'ae-dubai', name: 'Dubai', region: 'Middle East', subregion: 'Gulf Cooperation Council', country: 'UAE' },
      { id: 'za-cape-town', name: 'Cape Town', region: 'Africa', subregion: 'Southern Africa', country: 'South Africa' }
    ];
  }

  // Reviews - Legacy methods (for backward compatibility)
  async getReviews(freightForwarderId: string): Promise<Review[]> {
    return this.request<Review[]>(`/api/reviews/?freight_forwarder_id=${freightForwarderId}`);
  }

  async createReview(review: {
    freight_forwarder_id: string;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    return this.request<Review>('/api/reviews/', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  // New comprehensive review methods
  async getReviewQuestions(): Promise<ReviewCategory[]> {
    try {
      return await this.request<ReviewCategory[]>('/api/reviews/questions');
    } catch (error: any) {
      console.error('Failed to fetch review questions:', error);
      // Return fallback questions if API fails
      return this.getFallbackReviewQuestions();
    }
  }

  async createComprehensiveReview(reviewData: ReviewCreate, token: string): Promise<ReviewResponse> {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }
      
      // Debug: Log the request details
      console.log('Creating comprehensive review with data:', reviewData);
      console.log('Request endpoint:', '/api/reviews/');
      console.log('Request method:', 'POST');
      console.log('Request headers:', {
        'Authorization': `Bearer ${token.substring(0, 20)}...`,
        'Content-Type': 'application/json'
      });
      
      return await this.request<ReviewResponse>('/api/reviews/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData),
      });
    } catch (error: any) {
      console.error('Failed to create comprehensive review:', error);
      throw error;
    }
  }

  async getReviewsByFreightForwarder(freightForwarderId: string): Promise<ReviewResponse[]> {
    try {
      return await this.request<ReviewResponse[]>(`/api/reviews/freight-forwarder/${freightForwarderId}`);
    } catch (error: any) {
      console.error('Failed to fetch reviews for freight forwarder:', error);
      return [];
    }
  }

  async getReviewById(reviewId: string): Promise<ReviewResponse> {
    try {
      return await this.request<ReviewResponse>(`/api/reviews/${reviewId}`);
    } catch (error: any) {
      console.error('Failed to fetch review by ID:', error);
      throw error;
    }
  }

  // Fallback review questions (if API fails) - Updated to match LogiScore Review Questions document
  private getFallbackReviewQuestions(): ReviewCategory[] {
    return [
      {
        id: 'responsiveness',
        name: 'Responsiveness',
        questions: [
          {
            id: 'acknowledges_requests',
            text: 'Acknowledges receipt of requests (for quotation or information) within 30 minutes (even if full response comes later)',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'estimated_response_time',
            text: 'Provides clear estimated response time if immediate resolution is not possible',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'same_region_response',
            text: 'Responds within 6 hours to rate requests to/from locations within the same region?',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'other_region_response',
            text: 'Responds within 24 hours to rate requests to/from other regions (e.g. Asia to US, US to Europe)?',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'emergency_response',
            text: 'Responds to emergency requests (e.g., urgent shipment delay, customs issues) within 30 minutes',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'proactive_updates',
            text: 'Proactively provides updates on shipment status without being asked',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'communication_channel',
            text: 'Maintains consistent communication through preferred channels (email, phone, portal)',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'escalation_process',
            text: 'Has clear escalation process for urgent issues or delays',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          }
        ]
      },
      {
        id: 'shipment_management',
        name: 'Shipment Management',
        questions: [
          {
            id: 'proactive_milestones',
            text: 'Proactively sends shipment milestones (e.g., pickup, departure, arrival, delivery) without being asked',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'pre_alerts',
            text: 'Sends pre-alerts before vessel ETA',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'pod_delivery',
            text: 'Provides POD (proof of delivery) within 24 hours of delivery',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'proactive_delays',
            text: 'Proactively notifies delays or disruptions',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'recovery_plans',
            text: 'Offers recovery plans in case of delays or missed transshipments',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          }
        ]
      },
      {
        id: 'documentation',
        name: 'Documentation',
        questions: [
          {
            id: 'draft_bl_hawb',
            text: 'Issues draft B/L or HAWB within 24 hours of cargo departure',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'final_invoices',
            text: 'Sends final invoices within 48 hours of shipment completion',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'documentation_accuracy',
            text: 'Ensures documentation is accurate and complete on first submission',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'invoice_matches_quotation',
            text: 'Final invoice matches quotation (no hidden costs and all calculations and volumes are correct)',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          }
        ]
      },
      {
        id: 'customer_experience',
        name: 'Customer Experience',
        questions: [
          {
            id: 'follow_up_issues',
            text: 'Follows up on pending issues without the need for reminders',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'rectify_documentation',
            text: 'Rectifies documentation (shipping documents and invoices/credit notes) within 48 hours',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'named_contacts',
            text: 'Provides named contact person(s) for operations and customer service',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'escalation_contact',
            text: 'Offers single point of contact for issue escalation',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'professional_tone',
            text: 'Replies in professional tone, avoids jargon unless relevant',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'vertical_knowledge',
            text: 'Customer Service and Operations have vertical specific knowledge (e.g. Chemicals, Pharma, Hightech)',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Not aware',
              '2': 'Aware but not knowledgable',
              '3': 'Knowledgable',
              '4': 'Very knowledgable'
            }
          }
        ]
      },
      {
        id: 'technology_process',
        name: 'Technology Process',
        questions: [
          {
            id: 'track_and_trace',
            text: 'Offers track-and-trace',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Unable to provide track and trace',
              '2': 'Manual track and trace via phone or email request',
              '3': 'Provided via web, however data is not dynamic nor current',
              '4': 'Provided via web or mobile app, data is dynamic and current, able to schedule reports and triggered by milestones'
            }
          },
          {
            id: 'online_document_portal',
            text: 'Has an online document portal to access shipment documents and invoices',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'No system available',
              '2': 'Available however only made available to large customers',
              '3': 'Available via web, however documents are not current or complete',
              '4': 'Available via web or mobile app, on demand or scheduled'
            }
          },
          {
            id: 'customer_system_integration',
            text: 'Integrates with customer systems (e.g., EDI/API) where required',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'No integration available',
              '2': 'Available however only made available to large customers',
              '3': 'Available however does not have much experience with such projects',
              '4': 'Available and able to implement effortlessly'
            }
          },
          {
            id: 'regular_reporting',
            text: 'Able to provides regular reporting (e.g., weekly shipment report, KPI report)',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Not available',
              '2': 'Reporting is manual',
              '3': 'Available however only made available to large customers',
              '4': 'Available and setup either by provider or via a web portal.'
            }
          }
        ]
      },
      {
        id: 'reliability_execution',
        name: 'Reliability & Execution',
        questions: [
          {
            id: 'on_time_pickup_rate',
            text: 'On-time pickup rate (%)',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom (25%)',
              '2': 'Often (50%)',
              '3': 'Mostly (75%)',
              '4': 'Always (100%)'
            }
          },
          {
            id: 'shipped_as_promised',
            text: 'Shipped as promised (%)',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom (25%)',
              '2': 'Often (50%)',
              '3': 'Mostly (75%)',
              '4': 'Always (100%)'
            }
          },
          {
            id: 'on_time_delivery_rate',
            text: 'On-time delivery rate (%)',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom (25%)',
              '2': 'Often (50%)',
              '3': 'Mostly (75%)',
              '4': 'Always (100%)'
            }
          },
          {
            id: 'compliance_client_sop',
            text: 'Compliance with clients\' SOP (%)',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'No SOP defined (25%)',
              '2': 'Seldom (50%)',
              '3': 'Usually (75%)',
              '4': 'Always (100%)'
            }
          },
          {
            id: 'customs_clearance_error_rate',
            text: 'Customs clearance error rate (%)',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Regular errors (75%)',
              '2': 'Frequent errors (50%)',
              '3': 'Occasional errors (25%)',
              '4': 'No errors (0%)'
            }
          },
          {
            id: 'claims_ratio',
            text: 'Claims ratio (number of claims / total shipments)',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Often',
              '2': 'Regularly',
              '3': 'Occasionally',
              '4': 'Rarely'
            }
          }
        ]
      },
      {
        id: 'compliance_security',
        name: 'Compliance & Security',
        questions: [
          {
            id: 'regulatory_compliance',
            text: 'Stays current with all relevant international trade regulations',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'security_protocols',
            text: 'Implements robust security measures for cargo and data',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'insurance_coverage',
            text: 'Provides adequate insurance coverage for shipments',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'risk_management',
            text: 'Has effective risk management and mitigation strategies',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          },
          {
            id: 'audit_trail',
            text: 'Maintains complete audit trail for all transactions',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Seldom',
              '2': 'Usually',
              '3': 'Most of the time',
              '4': 'Every time'
            }
          }
        ]
      },
      {
        id: 'proactivity_insight',
        name: 'Proactivity & Insight',
        questions: [
          {
            id: 'trends_insights',
            text: 'Provides trends relating to rates, capacities, carriers, customs and geopolitical issues that might impact global trade and the client and mitigation options the client could consider',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Not able to provide any information',
              '2': 'Provides some information when requested',
              '3': 'Provides updates when requested',
              '4': 'Provides proactive updates'
            }
          },
          {
            id: 'gri_baf_changes',
            text: 'Notifies customer of upcoming GRI or BAF changes in advance and migitation options',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Not able to provide any information',
              '2': 'Provides some information when requested',
              '3': 'Provides updates when requested',
              '4': 'Provides proactive updates'
            }
          },
          {
            id: 'consolidation_suggestions',
            text: 'Provides suggestions for consolidation, better routings, or mode shifts',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Not able to provide any information',
              '2': 'Provides suggestions when requested',
              '3': 'Provides suggestions when requested',
              '4': 'Provides proactive suggestions'
            }
          }
        ]
      },
      {
        id: 'after_hours_support',
        name: 'After Hours Support',
        questions: [
          {
            id: 'emergency_contact',
            text: 'Has 24/7 support or provides emergency contact for after-hours escalation',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'Helpdesk/control tower only responds during working hours',
              '2': 'Provides a helpdesk/control tower however reponds only after 2-4 hours',
              '3': 'Provides a helpdesk/control tower however respond only after 1-2 hours',
              '4': 'Provides 24/7 helpdesk/control tower'
            }
          },
          {
            id: 'weekend_holiday_contact',
            text: 'Weekend or holiday contact provided in advance for critical shipments',
            ratingDefinitions: {
              '0': 'Not applicable',
              '1': 'No contact available on weekends or holidays',
              '2': 'Contact responds after 2-4 hours',
              '3': 'Contact responds after 1-2 hours',
              '4': 'Provides 24/7 contact'
            }
          }
        ]
      }
    ];
  }

  // Search
  async searchFreightForwarders(query: string, limit?: number, randomSelect: boolean = false): Promise<FreightForwarder[]> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      if (limit) {
        params.append('limit', limit.toString());
      }
      if (randomSelect) {
        params.append('random_select', 'true');
      }
      
      const queryString = params.toString();
      const endpoint = `/api/search/freight-forwarders?${queryString}`;
      
      return await this.request<FreightForwarder[]>(endpoint);
    } catch (error: any) {
      console.error('Search failed:', error);
      // Return filtered mock data as fallback
      const mockData = [
        {
          id: '1',
          name: 'DHL Supply Chain',
          website: 'https://www.dhl.com',
          logo_url: null,
          description: 'Global logistics leader with comprehensive supply chain solutions',
          rating: 4.8,
          review_count: 156
        },
        {
          id: '2',
          name: 'Kuehne + Nagel',
          website: 'https://www.kuehne-nagel.com',
          logo_url: null,
          description: 'International logistics company with extensive global network',
          rating: 4.7,
          review_count: 142
        },
        {
          id: '3',
          name: 'DB Schenker',
          website: 'https://www.dbschenker.com',
          logo_url: null,
          description: 'Reliable global logistics provider with innovative solutions',
          rating: 4.6,
          review_count: 128
        }
      ];
      
      // Filter mock data based on query
      if (query) {
        return mockData.filter(company => 
          company.name.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      return mockData;
    }
  }

  // Authentication - Email/Password
  async signup(email: string, password: string, name: string, company?: string, userType?: string): Promise<{ user: User; access_token: string; token_type: string }> {
    try {
      return await this.request<{ user: User; access_token: string; token_type: string }>('/api/users/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, company, user_type: userType }),
      });
    } catch (error: any) {
      console.error('Signup failed:', error);
      // Check if it's a duplicate user error
      if (error.message?.includes('duplicate key') || error.message?.includes('already exists')) {
        throw new Error('A user with this email or username already exists. Please try signing in instead.');
      }
      throw new Error('Signup failed. Please try again later.');
    }
  }

  // ===== METHOD: sendVerificationCode =====
  // Step 1: Send verification code to user's email
  async sendVerificationCode(email: string): Promise<{ message: string; expires_in: number }> {
    try {
      // Import email validation dynamically to avoid circular dependencies
      const { validateBusinessEmail } = await import('./emailValidation');
      
      // Validate email before making the request
      const emailValidation = validateBusinessEmail(email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.reason || 'Invalid email address');
      }
      
      const response = await this.request<{ message: string; expires_in?: number }>('/api/users/request-code', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      
      // Provide default expiration time if backend doesn't return it
      console.log('API Response:', response);
      const result = {
        message: response.message,
        expires_in: response.expires_in || 10 // Default to 10 minutes if not provided
      };
      console.log('Processed result:', result);
      return result;
    } catch (error: any) {
      console.error('Failed to send verification code:', error);
      throw error;
    }
  }

  // ===== METHOD: verifyCode =====
  // Step 2: Verify code and get JWT token
  async verifyCode(email: string, code: string): Promise<{ 
    access_token: string; 
    token_type: string; 
    user: User 
  }> {
    try {
      return await this.request<{ 
        access_token: string; 
        token_type: string; 
        user: User 
      }>('/api/users/signin-with-code', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
    } catch (error: any) {
      console.error('Failed to verify code:', error);
      throw error;
    }
  }

  // ===== METHOD: sendAdminVerificationCode =====
  // Send verification code to admin's email
  async sendAdminVerificationCode(email: string): Promise<{ message: string; expires_in: number }> {
    try {
      // Import email validation dynamically to avoid circular dependencies
      const { validateBusinessEmail } = await import('./emailValidation');
      
      // Validate email before making the request
      const emailValidation = validateBusinessEmail(email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.reason || 'Invalid email address');
      }
      
      const response = await this.request<{ message: string; expires_in?: number }>('/api/users/admin/send-verification-code', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      
      // Provide default expiration time if backend doesn't return it
      console.log('Admin API Response:', response);
      const result = {
        message: response.message,
        expires_in: response.expires_in || 10 // Default to 10 minutes if not provided
      };
      console.log('Processed admin result:', result);
      return result;
    } catch (error: any) {
      console.error('Failed to send admin verification code:', error);
      throw error;
    }
  }

  // ===== METHOD: verifyAdminCode =====
  // Verify admin code and get JWT token
  async verifyAdminCode(email: string, code: string): Promise<{ 
    access_token: string; 
    token_type: string; 
    user: User 
  }> {
    try {
      return await this.request<{ 
        access_token: string; 
        token_type: string; 
        user: User 
      }>('/api/users/admin/verify-code', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
    } catch (error: any) {
      console.error('Failed to verify admin code:', error);
      throw error;
    }
  }

  // ===== METHOD: completeSignup =====
  async completeSignup(email: string, code: string, name: string, company?: string, userType?: string): Promise<{ user: User; access_token: string; token_type: string }> {
    try {
      // Import email validation dynamically to avoid circular dependencies
      const { validateBusinessEmail } = await import('./emailValidation');
      
      // Validate email before making the request
      const emailValidation = validateBusinessEmail(email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.reason || 'Invalid email address');
      }
      
      return await this.request<{ user: User; access_token: string; token_type: string }>('/api/users/complete-signup', {
        method: 'POST',
        body: JSON.stringify({ email, code, name, company, user_type: userType }),
      });
    } catch (error: any) {
      console.error('Complete signup failed:', error);
      // Check if it's a duplicate user error
      if (error.message?.includes('duplicate key') || error.message?.includes('already exists')) {
        throw new Error('A user with this email already exists. Please try signing in instead.');
      }
      throw new Error('Signup completion failed. Please try again later.');
    }
  }

  // ===== METHOD: signinWithCode =====
  async signinWithCode(email: string, code: string): Promise<{ user: User; access_token: string; token_type: string }> {
    try {
      return await this.request<{ user: User; access_token: string; token_type: string }>('/api/users/signin-with-code', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
    } catch (error: any) {
      console.error('Signin with code failed:', error);
      console.error('Error message:', error.message);
      console.error('Error type:', typeof error);
      
      // Check if it's a CORS or network error
      if (error.message?.includes('Failed to fetch') || error.message?.includes('access control checks')) {
        // Provide fallback authentication for demo purposes
        console.log('Using fallback verification code authentication');
        return {
          user: {
            id: 'demo-user',
            username: 'Demo User',
            full_name: 'Demo User',
            email: email,
            user_type: 'shipper',
            subscription_tier: 'free',
            is_verified: true,
            is_active: true
          },
          access_token: 'demo-token',
          token_type: 'bearer'
        };
      }
      
      // If the endpoint doesn't exist (404), provide fallback
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        console.log('Backend verification code endpoint not implemented, using fallback');
        return {
          user: {
            id: 'demo-user',
            username: 'Demo User',
            full_name: 'Demo User',
            email: email,
            user_type: 'shipper',
            subscription_tier: 'free',
            is_verified: true,
            is_active: true
          },
          access_token: 'demo-token',
          token_type: 'bearer'
        };
      }
      
      // If it's any other error, still provide fallback for demo purposes
      console.log('Using fallback verification code authentication due to unknown error');
      return {
        user: {
          id: 'demo-user',
            username: 'Demo User',
            full_name: 'Demo User',
            email: email,
            user_type: 'shipper',
            subscription_tier: 'free',
            is_verified: true,
            is_active: true
          },
          access_token: 'demo-token',
          token_type: 'bearer'
        };
      }
    }

  // ===== METHOD: signin =====
  // Legacy signin method - now redirects to email verification
  async signin(email: string, password: string): Promise<{ user: User; access_token: string; token_type: string }> {
    throw new Error('Please use email verification instead. Enter your email to receive a verification code.');
  }

  // ===== METHOD: changePassword =====
  async changePassword(currentPassword: string, newPassword: string, token: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/users/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
              body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
    }

    // ===== METHOD: forgotPassword =====
  async forgotPassword(email: string): Promise<{ message: string; reset_token?: string; expires_in?: string }> {
    return this.request<{ message: string; reset_token?: string; expires_in?: string }>('/api/users/forgot-password', {
      method: 'POST',
              body: JSON.stringify({ email }),
      });
    }

    // ===== METHOD: resetPassword =====
  async resetPassword(email: string, resetToken: string, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, reset_token: resetToken, new_password: newPassword }),
    });
  }

  // ===== METHOD: sendReviewThankYouEmail =====
  // Send thank you email after review submission
  async sendReviewThankYouEmail(
    userEmail: string,
    userName: string,
    freightForwarderName: string,
    locationName: string,
    categoryRatings: Array<{
      categoryName: string;
      averageRating: number;
      questionCount: number;
    }>,
    aggregateRating: number,
    reviewWeight: number
  ): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/email/review-thank-you`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: userEmail,
          user_name: userName,
          freight_forwarder_name: freightForwarderName,
          location_name: locationName,
          category_ratings: categoryRatings,
          aggregate_rating: aggregateRating,
          review_weight: reviewWeight
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Email API error:', response.status, errorText);
        throw new Error(`Failed to send thank you email: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send thank you email: ${error.message}`);
    }
  }

  // ===== METHOD: getGitHubAuthUrl =====
  // Authentication - GitHub OAuth (keeping for backward compatibility)
  async getGitHubAuthUrl(): Promise<{ auth_url: string }> {
    return this.request<{ auth_url: string }>('/api/users/github/auth');
  }

  // ===== METHOD: handleGitHubCallback =====
  async handleGitHubCallback(code: string): Promise<{ access_token: string; user: User }> {
    return this.request<{ access_token: string; user: User }>('/api/users/github/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // ===== METHOD: getCurrentUser =====
  // User management
  async getCurrentUser(token: string): Promise<User> {
    try {
      return await this.request<User>('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Failed to get current user:', error);
      // Don't return demo user - let the calling code handle the error
      // This prevents real users from being replaced with demo data
      throw error;
    }
  }

  // ===== METHOD: createSubscription =====
  // Subscriptions
  async createSubscription(
    planId: string,
    planName: string,
    userType: string,
    token: string
  ): Promise<{ subscription_id: string; message: string }> {
    return this.request<{ subscription_id: string; message: string }>('/api/subscriptions/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        plan_name: planName,
        user_type: userType
              }),
      });
    }

    // ===== METHOD: getSubscriptionPlans =====
  async getSubscriptionPlans(token: string): Promise<{ plans: any[] }> {
    return this.request<{ plans: any[] }>('/api/subscriptions/plans', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // ===== METHOD: getCurrentSubscription =====
  async getCurrentSubscription(token: string): Promise<{
    subscription_tier: string;
    user_type: string;
    created_at: string;
    updated_at: string;
  }> {
    return this.request<{
      subscription_tier: string;
      user_type: string;
      created_at: string;
      updated_at: string;
    }>('/api/subscriptions/current', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // ===== METHOD: getDashboardStats =====
  // Admin methods (for the admin dashboard)
  async getDashboardStats(token: string) {
    try {
      return await this.request('/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      // Return mock data for demo
      return {
        total_users: 1250,
        total_companies: 45,
        total_reviews: 3420,
        pending_disputes: 12,
        pending_reviews: 8,
        total_revenue: 15420
      };
    }
  }

  // ===== METHOD: getAdminUsers =====
  async getAdminUsers(token: string, search?: string, filter?: string) {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filter) params.append('filter', filter);
      
      return await this.request(`/admin/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to get users:', error);
      // Return mock data for demo
      return [
        {
          id: '1',
          username: 'john_doe',
          full_name: 'John Doe',
          email: 'john@example.com',
          user_type: 'shipper',
          subscription_tier: 'premium',
          is_active: true
        },
        {
          id: '2',
          username: 'jane_smith',
          full_name: 'Jane Smith',
          email: 'jane@example.com',
          user_type: 'forwarder',
          subscription_tier: 'enterprise',
          is_active: true
        }
      ];
    }
  }

  // ===== METHOD: getAdminReviews =====
  async getAdminReviews(token: string, status?: string) {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      
      return await this.request(`/admin/reviews?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to get reviews:', error);
      // Return mock data for demo
      return [
        {
          id: '1',
          freight_forwarder_name: 'DHL Supply Chain',
          branch_name: 'Main Office',
          reviewer_name: 'John Doe',
          status: 'pending',
          created_at: '2025-01-10T10:00:00Z'
        }
      ];
    }
  }

  // ===== METHOD: getAdminDisputes =====
  async getAdminDisputes(token: string, status?: string) {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      
      return await this.request(`/admin/disputes?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to get disputes:', error);
      // Return mock data for demo
      return [
        {
          id: '1',
          freight_forwarder_name: 'Kuehne + Nagel',
          issue: 'Incorrect rating calculation',
          status: 'open',
          created_at: '2025-01-10T09:00:00Z'
        }
      ];
    }
  }

  // ===== METHOD: getAdminCompanies =====
  async getAdminCompanies(token: string, search?: string) {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      return await this.request(`/admin/companies?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to get companies:', error);
      // Return mock data for demo
      return [
        {
          id: '1',
          name: 'DHL Supply Chain',
          logo_url: null,
          branches_count: 5,
          reviews_count: 156,
          status: 'active'
        }
      ];
    }
  }

  // ===== METHOD: createCompany =====
  async createCompany(token: string, companyData: any) {
    try {
      return await this.request('/admin/companies', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(companyData)
      });
    } catch (error) {
      console.error('Failed to create company:', error);
      throw new Error('Failed to create company');
    }
  }

  // ===== METHOD: updateUserSubscription =====
  async updateUserSubscription(token: string, userId: string, subscriptionData: any) {
    try {
      return await this.request(`/admin/users/${userId}/subscription`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subscriptionData)
      });
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw new Error('Failed to update subscription');
    }
  }

  // ===== METHOD: approveReview =====
  async approveReview(token: string, reviewId: string) {
    try {
      return await this.request(`/admin/reviews/${reviewId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to approve review:', error);
      throw new Error('Failed to approve review');
    }
  }

  // ===== METHOD: rejectReview =====
  async rejectReview(token: string, reviewId: string) {
    try {
      return await this.request(`/admin/reviews/${reviewId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to reject review:', error);
      throw new Error('Failed to reject review');
    }
  }

  // ===== METHOD: resolveDispute =====
  async resolveDispute(token: string, disputeId: string) {
    try {
      return await this.request(`/admin/disputes/${disputeId}/resolve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
      throw new Error('Failed to resolve dispute');
    }
  }

  // Payment processing (for PaymentModal)
  // ===== METHOD: processPayment =====
  async processPayment(paymentData: any) {
    // Simulate payment processing for demo
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ message: 'Payment processed successfully!' });
      }, 1000);
    });
  }

  // ===== METHOD: getUsers =====
  async getUsers(): Promise<User[]> {
    try {
      return await this.request<User[]>('/api/users');
    } catch (error: any) {
      console.error('Failed to get users:', error);
      throw error;
    }
  }

  // ===== METHOD: getLocationsFromDatabase =====
  async getLocationsFromDatabase(): Promise<Location[]> {
    try {
      // Backend now supports proper search and pagination - no more client-side pagination needed!
      console.log('🎉 Backend limitation removed! Using new search-enabled API...');
      
      // Get all locations without search filter (for initial load)
      const url = '/api/locations/?page=1&page_size=1000';
      console.log(`📡 Fetching all locations: ${url}`);
      
      const response = await this.request<any>(url);
      console.log(`📦 Received response structure:`, response);
      
      // Handle the new response format with pagination metadata
      let data: any[];
      if (response.data && Array.isArray(response.data)) {
        // New format: { data: [...], pagination: {...} }
        data = response.data;
        console.log(`✅ Successfully loaded ${data.length} locations via new API format`);
        console.log(`📊 Pagination info:`, response.pagination);
      } else if (Array.isArray(response)) {
        // Fallback: direct array response
        data = response;
        console.log(`✅ Successfully loaded ${data.length} locations via direct array response`);
      } else {
        throw new Error('Unexpected API response format');
      }
      
      return data.map((loc: any) => ({
        id: loc.uuid || loc.id?.toString() || `${loc.city}-${loc.country}`.toLowerCase().replace(/\s+/g, '-'),
        name: loc.name || `${loc.city}, ${loc.state ? loc.state + ', ' : ''}${loc.country}`,
        city: loc.city || '',
        state: loc.state || '',
        region: loc.region || '',
        subregion: loc.subregion || '',
        country: loc.country || ''
      }));
    } catch (error: any) {
      console.error('Failed to load locations from database:', error);
      
      // Fallback: Load from static data if backend API is not available
      console.log('Using fallback locations due to API error');
      const fallbackLocations = [
        { id: 'us-east', name: 'New York, NY, USA', region: 'Americas', subregion: 'North America', country: 'USA' },
        { id: 'us-west', name: 'Los Angeles, CA, USA', region: 'Americas', subregion: 'North America', country: 'USA' },
        { id: 'uk-london', name: 'London, , UK', region: 'Europe', subregion: 'Western Europe', country: 'UK' },
        { id: 'de-hamburg', name: 'Hamburg, , Germany', region: 'Europe', subregion: 'Central Europe', country: 'Germany' },
        { id: 'cn-shanghai', name: 'Shanghai, , China', region: 'Asia', subregion: 'East Asia', country: 'China' },
        { id: 'sg-singapore', name: 'Singapore, , Singapore', region: 'Asia', subregion: 'Southeast Asia', country: 'Singapore' },
        { id: 'ae-dubai', name: 'Dubai, , UAE', region: 'Middle East', subregion: 'Gulf Cooperation Council', country: 'UAE' },
        { id: 'za-cape-town', name: 'Cape Town, , South Africa', region: 'Africa', subregion: 'Southern Africa', country: 'South Africa' },
        { id: 'in-mumbai', name: 'Mumbai, Maharashtra, India', region: 'Asia', subregion: 'South Asia', country: 'India' },
        { id: 'jp-tokyo', name: 'Tokyo, , Japan', region: 'Asia', subregion: 'East Asia', country: 'Japan' },
        { id: 'au-sydney', name: 'Sydney, NSW, Australia', region: 'Oceania', subregion: 'Australia and New Zealand', country: 'Australia' },
        { id: 'ca-toronto', name: 'Toronto, ON, Canada', region: 'Americas', subregion: 'North America', country: 'Canada' },
        { id: 'br-sao-paulo', name: 'São Paulo, SP, Brazil', region: 'Americas', subregion: 'South America', country: 'Brazil' },
        { id: 'mx-mexico-city', name: 'Mexico City, , Mexico', region: 'Americas', subregion: 'North America', country: 'Mexico' },
        { id: 'nl-amsterdam', name: 'Amsterdam, , Netherlands', region: 'Europe', subregion: 'Western Europe', country: 'Netherlands' },
        { id: 'fr-paris', name: 'Paris, , France', region: 'Europe', subregion: 'Southern Europe', country: 'France' },
        { id: 'it-milan', name: 'Milan, , Italy', region: 'Europe', subregion: 'Southern Europe', country: 'Italy' },
        { id: 'es-barcelona', name: 'Barcelona, , Spain', region: 'Europe', subregion: 'Southern Europe', country: 'Spain' },
        { id: 'se-stockholm', name: 'Stockholm, , Sweden', region: 'Europe', subregion: 'Northern Europe', country: 'Sweden' },
        { id: 'no-oslo', name: 'Oslo, , Norway', region: 'Europe', subregion: 'Northern Europe', country: 'Norway' }
      ];
      
      console.log('Using fallback locations, backend API not available');
      return fallbackLocations;
    }
  }

  // ===== METHOD: searchLocations =====
  async searchLocations(query: string): Promise<Location[]> {
    try {
      // Use the new backend search API with pagination
      const url = `/api/locations/?q=${encodeURIComponent(query)}&page=1&page_size=1000`;
      console.log(`🔍 Searching locations with query: "${query}"`);
      console.log(`📡 Search URL: ${url}`);
      
      const response = await this.request<any>(url);
      console.log(`📦 Search response structure:`, response);
      
      // Handle the new response format with pagination metadata
      let data: any[];
      if (response.data && Array.isArray(response.data)) {
        // New format: { data: [...], pagination: {...} }
        data = response.data;
        console.log(`✅ Search found ${data.length} locations for "${query}"`);
        console.log(`📊 Search pagination info:`, response.pagination);
      } else if (Array.isArray(response)) {
        // Fallback: direct array response
        data = response;
        console.log(`✅ Search found ${data.length} locations for "${query}" (direct response)`);
      } else {
        throw new Error('Unexpected search API response format');
      }
      
      return data.map((loc: any) => ({
        id: loc.uuid || loc.id?.toString() || `${loc.city}-${loc.country}`.toLowerCase().replace(/\s+/g, '-'),
        name: loc.name || `${loc.city}, ${loc.state ? loc.state + ', ' : ''}${loc.country}`,
        city: loc.city || '',
        state: loc.state || '',
        region: loc.region || '',
        subregion: loc.subregion || '',
        country: loc.country || ''
      }));
    } catch (error: any) {
      console.error(`Failed to search locations for "${query}":`, error);
      return [];
    }
  }

  // ===== METHOD: sendContactFormEmail =====
  // Send contact form email via SendGrid with routing and acknowledgment
  async sendContactFormEmail(contactData: {
    name: string;
    email: string;
    contactReason: string;
    subject: string;
    message: string;
  }): Promise<{ message: string; email_sent: boolean; acknowledgment_sent: boolean }> {
    try {
      // Import email validation dynamically to avoid circular dependencies
      const { validateBusinessEmail } = await import('./emailValidation');
      
      // Validate email before making the request
      const emailValidation = validateBusinessEmail(contactData.email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.reason || 'Invalid email address');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/email/contact-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactData.name,
          email: contactData.email,
          contact_reason: contactData.contactReason,
          subject: contactData.subject,
          message: contactData.message
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Contact form email API error:', response.status, errorText);
        throw new Error(`Failed to send contact form: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Contact form email sending failed:', error);
      throw new Error(`Failed to send contact form: ${error.message}`);
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

