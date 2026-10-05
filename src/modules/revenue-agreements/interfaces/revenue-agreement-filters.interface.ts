import {
  CompensationType,
  RevenueParticipantType,
} from "../../../shared/enums";

export interface RevenueAgreementFilters {
  companyId: number;

  casePublicId?: string;

  participantPublicId?: string;

  participantType?: RevenueParticipantType;

  compensationType?: CompensationType;

  active?: boolean;
}
