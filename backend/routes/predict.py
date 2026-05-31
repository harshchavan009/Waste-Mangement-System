from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import sys

# Add ai_model to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ai_model.classifier import predict_waste

router = APIRouter()

WASTE_DATA = {
    'Plastic': {
        'disposal': 'Please clean and place in the blue recycling bin.',
        'recycling': 'Can be recycled into new plastic containers, packaging, or synthetic clothing fibers.',
        'reuse': 'Upcycle into planters, bird feeders, or DIY organizers.',
        'centers': 'City Center Recycling Facility, EcoHub Downtown.',
        'pollution_reduction': 'Prevents microplastics from entering marine ecosystems.',
        'co2_savings': 'Saves ~2.5 kg of CO₂ emissions per kg of plastic recycled.',
        'recycling_impact': 'Reduces crude oil consumption by 1.5 liters per kg.'
    },
    'Metal': {
        'disposal': 'Ensure cans are empty and rinsed before placing in the metal bin.',
        'recycling': 'Metals are infinitely recyclable. Used for new cans, automotive parts, or construction materials.',
        'reuse': 'Use large tins as storage containers or for DIY industrial lamps.',
        'centers': 'Scrap Metal Recyclers Inc., GreenCity Depot.',
        'pollution_reduction': 'Reduces toxic mining runoff and habitat destruction.',
        'co2_savings': 'Recycling aluminum saves 95% of the CO₂ emissions compared to primary production.',
        'recycling_impact': 'Saves enough energy to run a TV for 3 hours per can.'
    },
    'Glass': {
        'disposal': 'Handle with care. Place in the green glass recycling container.',
        'recycling': 'Glass is sorted by color, crushed, and melted to make new bottles and jars.',
        'reuse': 'Perfect for terrariums, candle holders, or bulk food storage.',
        'centers': 'GlassWorks Recycling Center.',
        'pollution_reduction': 'Reduces landfill volume, as glass takes 1 million years to decompose.',
        'co2_savings': 'Saves ~315 kg of CO₂ per ton of glass recycled.',
        'recycling_impact': 'Conserves 1.2 tons of raw materials (sand, soda ash, limestone) per ton of glass.'
    },
    'Paper': {
        'disposal': 'Keep dry and flat. Place in the paper recycling bin.',
        'recycling': 'Pulped and processed into recycled paper products, cardboard boxes, or tissue paper.',
        'reuse': 'Shred for packaging material or use in compost bins to balance carbon.',
        'centers': 'PaperTrail Recycling, Community Drop-off points.',
        'pollution_reduction': 'Decreases water pollution from paper manufacturing by 35%.',
        'co2_savings': 'Recycling 1 ton of paper saves ~1.5 tons of CO₂ emissions.',
        'recycling_impact': 'Saves 17 trees and 26,000 liters of water per ton.'
    },
    'Organic': {
        'disposal': 'Perfect for the compost bin. Do not mix with plastics.',
        'recycling': 'Breaks down naturally into nutrient-rich compost fertilizer for agriculture and gardens.',
        'reuse': 'Create homemade fertilizer or use scraps for vegetable broth.',
        'centers': 'City Community Gardens, Central Composting Facility.',
        'pollution_reduction': 'Prevents methane generation in anaerobic landfill environments.',
        'co2_savings': 'Composting reduces greenhouse gas equivalents by 50% compared to landfilling.',
        'recycling_impact': 'Restores topsoil nutrients, eliminating the need for chemical fertilizers.'
    },
    'Hazardous': {
        'disposal': 'Do not throw in regular bins! Take to a specialized hazardous waste collection center.',
        'recycling': 'Batteries and electronics are safely dismantled to extract rare earth metals and neutralize toxic chemicals.',
        'reuse': 'Do not attempt to reuse. Some electronic parts can be donated to maker spaces if intact.',
        'centers': 'E-Waste Solutions, Municipal Hazardous Waste Center.',
        'pollution_reduction': 'Prevents heavy metals (lead, mercury) from leaching into groundwater.',
        'co2_savings': 'Proper e-waste recycling dramatically reduces the carbon footprint of mining rare earth metals.',
        'recycling_impact': 'Recovers valuable materials like gold, silver, and palladium for reuse.'
    },
    'E-Waste': {
        'disposal': 'Do not throw in regular bins! Take to a specialized hazardous waste collection center.',
        'recycling': 'Batteries and electronics are safely dismantled to extract rare earth metals and neutralize toxic chemicals.',
        'reuse': 'Do not attempt to reuse. Some electronic parts can be donated to maker spaces if intact.',
        'centers': 'E-Waste Solutions, Municipal Hazardous Waste Center.',
        'pollution_reduction': 'Prevents heavy metals (lead, mercury) from leaching into groundwater.',
        'co2_savings': 'Proper e-waste recycling dramatically reduces the carbon footprint of mining rare earth metals.',
        'recycling_impact': 'Recovers valuable materials like gold, silver, and palladium for reuse.'
    }
}

@router.post("")
async def classify_waste_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    try:
        contents = await file.read()
        
        # In a real scenario, we might want to save the file temporarily or pass the bytes
        # to our model. We will pass bytes to our classifier.
        result = predict_waste(contents)
        cat = result["category"]
        
        # Default empty dict in case of category mismatch
        details = WASTE_DATA.get(cat, {
            'disposal': result.get("instructions", "Dispose carefully."),
            'recycling': "",
            'reuse': "",
            'centers': "",
            'pollution_reduction': "",
            'co2_savings': "",
            'recycling_impact': ""
        })
        
        return {
            "success": True,
            "filename": file.filename,
            "prediction": cat,
            "confidence": result["confidence"],
            "disposal_instructions": details.get('disposal', ''),
            "recycling_suggestions": details.get('recycling', ''),
            "reuse_ideas": details.get('reuse', ''),
            "recycling_centers": details.get('centers', ''),
            "pollution_reduction": details.get('pollution_reduction', ''),
            "co2_savings": details.get('co2_savings', ''),
            "recycling_impact": details.get('recycling', '')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

