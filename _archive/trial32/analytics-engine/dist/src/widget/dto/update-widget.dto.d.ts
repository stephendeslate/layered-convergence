import { WidgetType } from './create-widget.dto.js';
export declare class UpdateWidgetDto {
    type?: WidgetType;
    config?: Record<string, any>;
    positionX?: number;
    positionY?: number;
    width?: number;
    height?: number;
}
