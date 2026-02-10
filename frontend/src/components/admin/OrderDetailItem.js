import React from 'react';

/**
 * OrderDetailItem component
 * Extracted to a separate file to prevent "Maximum call stack size exceeded" 
 * in the visual-edits Babel plugin by simplifying the AST of the parent component's map.
 */
const OrderDetailItem = ({ item }) => {
    const { image, name, quantity, price } = item;

    return (
        <div className="flex gap-4 items-center font-sans py-2">
            <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0 border">
                {image ? (
                    <img src={image} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <i className="fa-solid fa-box text-muted-foreground/30 text-lg"></i>
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{name}</p>
                <p className="text-xs text-muted-foreground">QTY: {quantity} @ ₹{price}</p>
            </div>
            <div className="text-sm font-semibold text-nowrap text-primary">
                ₹{price * quantity}
            </div>
        </div>
    );
};

export default OrderDetailItem;
