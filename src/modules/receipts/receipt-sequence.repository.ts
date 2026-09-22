import type { EntityManager } from "typeorm";

import { AppDataSource } from "../../bootstrap/database";

import { ReceiptSequenceEntity } from "./receipt-sequence.entity";

export class ReceiptSequenceRepository {
  private repository = AppDataSource.getRepository(ReceiptSequenceEntity);

  async getNextNumber(
    companyId: number,
    year: number,
    manager?: EntityManager,
  ): Promise<number> {
    const executor = manager ?? this.repository.manager;

    const result = await executor.query(
      `
          INSERT INTO receipt_sequences (
            company_id,
            year,
            last_number,
            created_at,
            updated_at
          )
          VALUES (
            $1,
            $2,
            1,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )

          ON CONFLICT (
            company_id,
            year
          )

          DO UPDATE SET
            last_number =
              receipt_sequences.last_number + 1,

            updated_at =
              CURRENT_TIMESTAMP

          RETURNING
            last_number;
        `,
      [companyId, year],
    );

    const nextNumber = Number(result?.[0]?.last_number);

    if (!Number.isInteger(nextNumber) || nextNumber <= 0) {
      throw new Error("Unable to generate receipt sequence number.");
    }

    return nextNumber;
  }
}
