/**
* 
* Christopher Pyper
* 
**/

/**
* Class Draw
*
**/
var Draw = function(node)
{
    // Document ohject reference for
    this.node = null;
    
    // Drawing object
    this.jg = null;
    
    // Arrow angle, angle of arrow head in degrees
    this.arrowHeadAngle =30;
    
    // Length of arrow head in pixels
    this.arrowHeadLength = 30;
    
    // Line thickness
    this.arrowLineThickNess = 5;
    
    // Constructor
    this.Draw = function(node)
    {
        // Set node Reference
        this.node = node;
        
        // Instantiate drawing object
        this.jg = new jsGraphics(node);
        
        // Set Stroke thickness
        this.jg.setStroke(this.arrowLineThickNess);
        
        this.jg.setPrintable(true);
    };
    this.Draw(node); // Call constructor
    
    // Given x,y coordinates, a length, and a angle, calulate the x,y coordinates of the endpoint of that line
    // Remeber this is HTML/CSS so everything is flipped on the x-axis of a Cartesian plane.
    this.calculateEndPoint = function(startX, startY, length, angle)
    {
        // Set up for sine line
        var a = length;
        var A = this.convertDegreesToRadians(90); // Use a right triangle
        var b = null;
        var B = this.convertDegreesToRadians(180) - A - angle; // All sides of a triangle add up to 180 degrees
        var c = null;
        var C = angle;
        
        // Sine law states that a/sin(A) = b/sin(B) = c/sin(C), use this solve for b and c 
        // Radians! remember radians, not degrees!
        b = (a/Math.sin(A)) * Math.sin(B);
        c = (a/Math.sin(A)) * Math.sin(C);
        
        // Round lengths so it can be mapped to pixels
        a = Math.round(a);
        b = Math.round(b);
        c = Math.round(c);
        
        var coordinates = new Array();
        
        // Calculate endpoint relative to start point
        coordinates["x"] = startX - b;
        coordinates["y"] = startY - c;
        
        return coordinates;
    };
    
    // Calculate the angle between two points in the Cartesian plane
    this.calculateAngle = function(startX, startY, endX, endY)
    {
        return (Math.atan2(endY - startY, endX - startX));
    };
    
    // Convert Radians to Degrees
    this.convertRadiansToDegrees = function(radians)
    {
        return (radians*(180/Math.PI));
    };
    
    // Convert Degrees to Radians
    this.convertDegreesToRadians = function(degrees)
    {
        return (degrees*(Math.PI/180));
    };
    
    // Draw a line between the two points
    this.drawLine = function(startX, startY, endX, endY)
    {
        this.jg.drawLine(startX, startY, endX, endY);
        this.jg.paint();
    };
    
    // Draw a polygon
    this.fillPolygon = function(xPoints, yPoints)
    {
        this.jg.fillPolygon(xPoints, yPoints);
        this.jg.paint();
    };
    
    // Draw arrow in the direction from start to end
    this.drawArrow = function(startX, startY, endX, endY, headOnly, solidHead)
    {
        // Calculate point angles of arrow tip relative to line angle
        var mainAngle   = this.calculateAngle(startX, startY, endX, endY);
        var headAngle1 = mainAngle + this.convertDegreesToRadians(this.arrowHeadAngle);
        var headAngle2 = mainAngle - this.convertDegreesToRadians(this.arrowHeadAngle);
        
        // Calulate endpoints of arrow tip lines
        var headEndPoint1 = this.calculateEndPoint(endX, endY, this.arrowHeadLength, headAngle1);
        var headEndPoint2 = this.calculateEndPoint(endX, endY, this.arrowHeadLength, headAngle2);
        
        // Draw the arrow
        if(!headOnly)
            this.drawLine(startX, startY, endX, endY);  // Main line            
        this.drawLine(endX, endY, headEndPoint1["x"], headEndPoint1["y"]); // Draw tip line
        this.drawLine(endX, endY, headEndPoint2["x"], headEndPoint2["y"]); // Draw tip line
        
        if(solidHead)
        {
            // Draw polygon to fill head
            var xPoints = new Array(endX, headEndPoint1["x"], headEndPoint2["x"], endX);
            var yPoints = new Array(endY, headEndPoint1["y"], headEndPoint2["y"], endY);
            this.fillPolygon(xPoints, yPoints);
        }
    };
    
    // Draw a line that traces it's way to it's target indirectly using right angle lines
    this.drawSquareLine = function(startX, startY, startAxis, endX, endY, endAxis, isArrow, doubleHeaded, solidHead)
    {
        // Count the number of bends in the line
        var elbowCount = 1;
        
        // Convert to lower case to make life easier
        startAxis = startAxis.toLowerCase();
        endAxis   = endAxis.toLowerCase();
        
        if(startAxis == endAxis)
            elbowCount = 2;
    
        // If the start axis is perpendicular to the end axis then the line only needs one elbow
        if(elbowCount == 1)
        {
            if(startAxis == "vertical")
            {
                this.drawLine(startX, endY, startX, startY);
                this.drawLine(startX, endY, endX, endY);
            }
            else
            {
                this.drawLine(startX, startY, endX, startY);
                this.drawLine(endX, startY, endX, endY);
            }
        }
        // If the start axis and end axis are parallel then we require two elbows
        else if(elbowCount == 2)
        {
            if(startAxis == "vertical")
            {
                var lineRise = startY - endY;
                
                this.drawLine(startX, startY, startX, startY - (Math.round(lineRise/2)));
                this.drawLine(startX, startY - (Math.round(lineRise/2)), endX, startY - (Math.round(lineRise/2)));
                this.drawLine(endX, startY - (Math.round(lineRise/2)), endX, endY);
            }
            else
            {
                var lineRun = startX - endX;
                
                this.drawLine(startX, startY, startX - (Math.round(lineRun/2)), startY);
                this.drawLine(startX - (Math.round(lineRun/2)), startY, startX - (Math.round(lineRun/2)), endY);
                this.drawLine(startX - (Math.round(lineRun/2)), endY, endX, endY);
            }
        }
    };
    
    // Add arrow head to square line
    this.drawSquareLineArrowHead = function(startX, startY, startAxis, endX, endY, endAxis, solidHead)
    {
        // Essentially fake the line segment to get the angle, and then attach a head
        (endAxis == "vertical") ? 
            this.drawArrowHead(endX, startY, endX, endY, solidHead) : 
                this.drawArrowHead(startX, endY, endX, endY, solidHead);
    };
    
    // End private drawing functions, Begin public implementation
    
    // Draw arrow in the direction of start to end
    this.drawSingleHeadedArrow = function(startX, startY, endX, endY)
    {
        this.drawArrow(startX, startY, endX, endY);
    };
    
    // Draw arrow head only, supply coordinates to calculate head angle
    this.drawArrowHead = function(startX, startY, endX, endY, solidHead)
    {
        this.drawArrow(startX, startY, endX, endY, true, solidHead);
    };
    
    // Draw double headed arrow
    this.drawDoubleHeadedArrow = function(startX, startY, endX, endY)
    {
        // First draw single headed arrow
        this.drawArrow(startX, startY, endX, endY);
        
        // Now draw a head on the other end
        this.drawArrowHead(endX, endY, startX, startY);
    };
    
    // Draw solid headed arrow
    this.drawSolidHeadedArrow = function(startX, startY, endX, endY)
    {
        this.drawArrow(startX, startY, endX, endY, false, true);
    };
    
    // Draw a solid double headed arrow
    this.drawSolidDoubleHeadedArrow = function(startX, startY, endX, endY)
    {
        // First draw a single headed arrow
        this.drawArrow(startX, startY, endX, endY, false, true);
        
        // Now draw a head on the other end
        this.drawArrowHead(endX, endY, startX, startY, true);
    };
    
    // Draw a square line arrow beginXis and endAxix are for calculating the number of right angled bends the arrow 
    // will have, expose flags for manilulating arrow heads
    this.drawSquareLineArrow = function(startX, startY, startAxis, endX, endY, endAxis, doubleHeaded, solidHead)
    {
        // Draw square line
        this.drawSquareLine(startX, startY, startAxis, endX, endY, endAxis);
        
        // Attach Head
        this.drawSquareLineArrowHead(startX, startY, startAxis, endX, endY, endAxis, solidHead);
        
        // Attach Head on the other end
        if(doubleHeaded)
            this.drawSquareLineArrowHead(endX, endY, endAxis, startX, startY, startAxis, solidHead);
    };
    
    // Draw sold headed square line arrow
    this.drawSolidHeadedSquareLineArrow = function(startX, startY, startAxis, endX, endY, endAxis)
    {
        this.drawSquareLineArrow(startX, startY, startAxis, endX, endY, endAxis, false, true);
    };
    
    // Draw double headed square line arrow
    this.drawDoubleHeadedSquareLineArrow = function(startX, startY, startAxis, endX, endY, endAxis, solidHead)
    {
        this.drawSquareLineArrow(startX, startY, startAxis, endX, endY, endAxis, true, solidHead);
    };
    
    // Draw solid ouble headed square line arrow
    this.drawSolidDoubleHeadedSquareLineArrow = function(startX, startY, startAxis, endX, endY, endAxis)
    {
        this.drawDoubleHeadedSquareLineArrow(startX, startY, startAxis, endX, endY, endAxis, true);
    };  
};
/**
* End Class Draw
**/