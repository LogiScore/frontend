from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional, List
from database.database import get_db
from database.models import FreightForwarder, Branch, Review
from datetime import datetime
from uuid import UUID
import random

router = APIRouter()

class FreightForwarderResponse(BaseModel):
    id: UUID
    name: str
    website: Optional[str]
    logo_url: Optional[str]
    description: Optional[str]
    headquarters_country: Optional[str]
    global_rank: Optional[int]
    is_active: bool
    rating: Optional[float]
    review_count: Optional[int]
    created_at: datetime
    updated_at: datetime
    category_scores: Optional[List[dict]] = []

    class Config:
        from_attributes = True

class BranchResponse(BaseModel):
    id: str
    name: str
    location: str
    address: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True

@router.get("/", response_model=List[FreightForwarderResponse])
async def get_freight_forwarders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    random_select: bool = Query(False, description="Randomly select companies if limit is exceeded"),
    db: Session = Depends(get_db)
):
    """Get list of freight forwarders with optional search and rating info"""
    # Build query with rating and review count
    query = db.query(
        FreightForwarder,
        func.avg(Review.overall_rating).label('avg_rating'),
        func.count(Review.id).label('review_count')
    ).outerjoin(Review, FreightForwarder.id == Review.freight_forwarder_id)
    
    if search:
        query = query.filter(FreightForwarder.name.ilike(f"%{search}%"))
    
    # Get all results first for potential random selection
    all_results = query.group_by(FreightForwarder.id).all()
    
    # Apply random selection if requested and we have more results than limit
    if random_select and len(all_results) > limit:
        # Randomly shuffle and take the first 'limit' results
        random.shuffle(all_results)
        results = all_results[:limit]
    else:
        # Apply normal pagination
        results = all_results[skip:skip + limit]
    
    # Convert to response format
    freight_forwarders = []
    for result in results:
        ff_data = {
            'id': result.FreightForwarder.id,
            'name': result.FreightForwarder.name,
            'website': result.FreightForwarder.website,
            'logo_url': result.FreightForwarder.logo_url,
            'description': result.FreightForwarder.description,
            'headquarters_country': result.FreightForwarder.headquarters_country,
            'global_rank': result.FreightForwarder.global_rank,
            'is_active': result.FreightForwarder.is_active,
            'rating': float(result.avg_rating) if result.avg_rating else None,
            'review_count': int(result.review_count) if result.review_count else 0,
            'created_at': result.FreightForwarder.created_at,
            'updated_at': result.FreightForwarder.updated_at
        }
        freight_forwarders.append(FreightForwarderResponse(**ff_data))
    
    return freight_forwarders

@router.get("/{freight_forwarder_id}", response_model=FreightForwarderResponse)
async def get_freight_forwarder(
    freight_forwarder_id: str,
    db: Session = Depends(get_db)
):
    """Get specific freight forwarder by ID with rating info and category scores"""
    # Query with rating and review count 
    result = db.query(
        FreightForwarder,
        func.avg(Review.overall_rating).label('avg_rating'),
        func.count(Review.id).label('review_count')
    ).outerjoin(Review, FreightForwarder.id == Review.freight_forwarder_id)\
     .filter(FreightForwarder.id == freight_forwarder_id)\
     .group_by(FreightForwarder.id)\
     .first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Freight forwarder not found")
    
    # Get review category scores
    category_scores = db.query(
        func.avg(Review.responsiveness_rating).label('responsiveness'),
        func.avg(Review.documentation_rating).label('documentation'),
        func.avg(Review.communication_rating).label('communication'),
        func.avg(Review.reliability_rating).label('reliability'),
        func.avg(Review.cost_effectiveness_rating).label('cost_effectiveness'),
        func.avg(Review.overall_rating).label('overall'),
        func.count(Review.id).label('review_count')
    ).filter(Review.freight_forwarder_id == freight_forwarder_id).first()
    
    # Convert to response format
    ff_data = {
        'id': result.FreightForwarder.id,
        'name': result.FreightForwarder.name,
        'website': result.FreightForwarder.website,
        'logo_url': result.FreightForwarder.logo_url,
        'description': result.FreightForwarder.description,
        'headquarters_country': result.FreightForwarder.headquarters_country,
        'global_rank': result.FreightForwarder.global_rank,
        'is_active': result.FreightForwarder.is_active,
        'rating': float(result.avg_rating) if result.avg_rating else None,
        'review_count': int(result.review_count) if result.review_count else 0,
        'created_at': result.FreightForwarder.created_at,
        'updated_at': result.FreightForwarder.updated_at,
        'category_scores': [
            {
                'category_name': 'Responsiveness',
                'average_score': float(category_scores.responsiveness) if category_scores.responsiveness else 0,
                'review_count': int(category_scores.review_count) if category_scores.review_count else 0
            },
            {
                'category_name': 'Documentation',
                'average_score': float(category_scores.documentation) if category_scores.documentation else 0,
                'review_count': int(category_scores.review_count) if category_scores.review_count else 0
            },
            {
                'category_name': 'Communication',
                'average_score': float(category_scores.communication) if category_scores.communication else 0,
                'review_count': int(category_scores.review_count) if category_scores.review_count else 0
            },
            {
                'category_name': 'Reliability',
                'average_score': float(category_scores.reliability) if category_scores.reliability else 0,
                'review_count': int(category_scores.review_count) if category_scores.review_count else 0
            },
            {
                'category_name': 'Cost Effectiveness',
                'average_score': float(category_scores.cost_effectiveness) if category_scores.cost_effectiveness else 0,
                'review_count': int(category_scores.review_count) if category_scores.review_count else 0
            },
            {
                'category_name': 'Overall',
                'average_score': float(category_scores.overall) if category_scores.overall else 0,
                'review_count': int(category_scores.review_count) if category_scores.review_count else 0
            }
        ] if category_scores else []
    }
    
    return FreightForwarderResponse(**ff_data)

@router.get("/{freight_forwarder_id}/branches", response_model=List[BranchResponse])
async def get_freight_forwarder_branches(
    freight_forwarder_id: str,
    db: Session = Depends(get_db)
):
    """Get branches for a specific freight forwarder"""
    branches = db.query(Branch).filter(
        Branch.freight_forwarder_id == freight_forwarder_id,
        Branch.is_active == True
    ).all()
    
    return [BranchResponse.from_orm(branch) for branch in branches] 
