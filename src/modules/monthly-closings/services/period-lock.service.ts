import { IsNull } from 'typeorm'
import { AppDataSource } from '../../../bootstrap/database'
import { ClosingStatus } from '../../../shared/enums'
import { ApiError } from '../../../shared/errors'
import { MonthlyClosingEntity } from '../monthly-closing.entity'

export class PeriodLockService {
    private repository = AppDataSource.getRepository(MonthlyClosingEntity)

    async validateOpenPeriod(companyId: number, transactionDate: string) {
        const date = new Date(`${transactionDate}T00:00:00`)

        const year = date.getFullYear()
        const month = date.getMonth() + 1

        const closing = await this.repository.findOne({
        where: {
            companyId,
            year,
            month,
            status: ClosingStatus.CLOSED,
            deletedAt: IsNull(),
        },
        })

        if (closing) {
        throw new ApiError(
            400,
            'PERIOD_CLOSED',
            'The accounting period is closed. Reopen the monthly closing before modifying transactions.'
        )
        }
    }
}