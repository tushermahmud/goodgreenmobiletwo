
import { ServiceCategory } from '../definitions/service-category.enum';
import { ServiceLicenseType } from '../definitions/service-license-type.enum';

export interface ServiceOffering {
    id: number;
    label: string;
    logoUrl: string;
    category: ServiceCategory;
    licenseType: ServiceLicenseType;
    // for manipulation only
    address: string;
}
