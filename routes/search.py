from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional, List
from database.database import get_db
from database.models import FreightForwarder, Review
import random

router = APIRouter()

class SearchResult(BaseModel):
    id: str
    name: str
    website: Optional[str]
    logo_url: Optional[str]
    description: Optional[str]
    services: Optional[str]
    specializations: Optional[str]
    rating: Optional[float]
    review_count: Optional[int]

    class Config:
        from_attributes = True

@router.get("/freight-forwarders", response_model=List[SearchResult])
async def search_freight_forwarders(
    q: Optional[str] = Query(None, description="Search query"),
    limit: int = Query(20, ge=1, le=100, description="Number of results"),
    random_select: bool = Query(False, description="Randomly select companies if limit is exceeded"),
    db: Session = Depends(get_db)
):
    """Search freight forwarders by name with rating info"""
    
    # Build query with rating and review count
    query = db.query(
        FreightForwarder,
        func.avg(Review.overall_rating).label('avg_rating'),
        func.count(Review.id).label('review_count')
    ).outerjoin(Review, FreightForwarder.id == Review.freight_forwarder_id)
    
    if q:
        query = query.filter(FreightForwarder.name.ilike(f"%{q}%"))
    
    # Get all results first for potential random selection
    all_results = query.group_by(FreightForwarder.id).all()
    
    # Apply random selection if requested and we have more results than limit
    if random_select and len(all_results) > limit:
        # Randomly shuffle and take the first 'limit' results
        random.shuffle(all_results)
        results = all_results[:limit]
    else:
        # Apply normal limit
        results = all_results[:limit]
    
    # Convert to response format
    search_results = []
    for result in results:
        ff_data = {
            'id': str(result.FreightForwarder.id),
            'name': result.FreightForwarder.name,
            'website': result.FreightForwarder.website,
            'logo_url': result.FreightForwarder.logo_url,
            'description': result.FreightForwarder.description,
            'services': result.FreightForwarder.services,
            'specializations': result.FreightForwarder.specializations,
            'rating': float(result.avg_rating) if result.avg_rating else None,
            'review_count': int(result.review_count) if result.review_count else 0
        }
        search_results.append(SearchResult(**ff_data))
    
    return search_results

@router.get("/suggestions")
async def get_search_suggestions(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Number of suggestions"),
    db: Session = Depends(get_db)
):
    """Get search suggestions for freight forwarder names"""
    
    suggestions = db.query(FreightForwarder.name)\
        .filter(FreightForwarder.name.ilike(f"%{q}%"))\
        .limit(limit)\
        .all()
    
    return [suggestion[0] for suggestion in suggestions] 
