import {
  ParticipantSettlementStatus,
  RevenueOwnerType,
} from "../../../shared/enums";

export interface ParticipantSettlementFilters {
  companyId: number;

  status?: ParticipantSettlementStatus;
  ownerType?: RevenueOwnerType;
  ownerPublicId?: string;
  participantStatementPublicId?: string;

  year?: number;
  month?: number;
}