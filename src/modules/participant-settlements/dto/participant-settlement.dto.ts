export interface CreateParticipantSettlementDto {
  notes?: string | null;
}

export interface CreateParticipantPayoutDto {
  amount: number;
  currency: string;
  payoutDate: string;
  paymentMethodCode: string;
  referenceNumber?: string | null;
  notes?: string | null;
  externalProvider?: string | null;
  externalTransactionId?: string | null;
}

export interface VoidParticipantPayoutDto {
  voidReason: string;
}