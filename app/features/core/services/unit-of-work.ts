import { injectable } from "inversify";
import type { Transaction } from "./transaction";

@injectable()
export abstract class UnitOfWork {
	abstract execute<T>(
		fn: (tx: Transaction) => Promise<T>,
		options?: { timeout: number; maxWait?: number },
	): Promise<T>;
}
