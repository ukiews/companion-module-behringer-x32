import osc from 'osc'
import { FeedbackId } from './feedback.js'

export class X32State implements IStoredChannelSubject {
	private readonly data: Map<string, osc.MetaArgument[]>
	private readonly pressStorage: Map<string, number>
	private readonly channelMeterLevels: number[]
	private readonly feedbackLatchUntil: Map<string, number>
	private readonly feedbackLatchConfig: Map<string, string>
	private readonly feedbackLatchTimers: Map<string, NodeJS.Timeout>
	private readonly feedbackLatchExpired: Set<string>
	private storedChannel: number

	constructor() {
		this.data = new Map()
		this.pressStorage = new Map()
		this.channelMeterLevels = []
		this.feedbackLatchUntil = new Map()
		this.feedbackLatchConfig = new Map()
		this.feedbackLatchTimers = new Map()
		this.feedbackLatchExpired = new Set()
		this.storedChannel = 1
	}

	// StoredChannelSubject
	private observers: IStoredChannelObserver[] = []

	attach(observer: IStoredChannelObserver): void {
		if (!this.observers.includes(observer)) {
			this.observers.push(observer)
		}
	}
	detach(observer: IStoredChannelObserver): void {
		const observerIndex = this.observers.indexOf(observer)
		if (observerIndex !== -1) {
			this.observers.splice(observerIndex, 1)
		}
	}

	notify(): void {
		for (const observer of this.observers) {
			observer.storedChannelChanged()
		}
	}

	// TODO better typings
	public get(path: string): osc.MetaArgument[] | undefined {
		return this.data.get(path)
	}
	public set(path: string, data: osc.MetaArgument[]): void {
		this.data.set(path, data)
	}

	public setPressValue(path: string, value: number): void {
		this.pressStorage.set(path, value)
	}
	public popPressValue(path: string): number | undefined {
		const val = this.pressStorage.get(path)
		if (val !== undefined) this.pressStorage.delete(path)
		return val
	}

	public setChannelMeterLevels(levels: number[]): void {
		this.channelMeterLevels.splice(0, this.channelMeterLevels.length, ...levels)
	}
	public getChannelMeterLevel(channelIndex: number): number | undefined {
		return this.channelMeterLevels[channelIndex]
	}

	public configureFeedbackLatch(feedbackId: string, config: string): void {
		if (this.feedbackLatchConfig.get(feedbackId) === config) return

		this.clearFeedbackLatchState(feedbackId)
		this.feedbackLatchConfig.set(feedbackId, config)
	}
	public setFeedbackLatchUntil(feedbackId: string, timestamp: number, onExpired: () => void): void {
		this.feedbackLatchUntil.set(feedbackId, timestamp)

		const existingTimer = this.feedbackLatchTimers.get(feedbackId)
		if (existingTimer) clearTimeout(existingTimer)

		const timer = setTimeout(
			() => {
				this.feedbackLatchTimers.delete(feedbackId)
				this.feedbackLatchUntil.delete(feedbackId)
				this.feedbackLatchExpired.add(feedbackId)
				onExpired()
			},
			Math.max(0, timestamp - Date.now()) + 1,
		)
		this.feedbackLatchTimers.set(feedbackId, timer)
	}
	public getFeedbackLatchUntil(feedbackId: string): number | undefined {
		return this.feedbackLatchUntil.get(feedbackId)
	}
	public consumeFeedbackLatchExpiration(feedbackId: string): boolean {
		const expired = this.feedbackLatchExpired.has(feedbackId)
		this.feedbackLatchExpired.delete(feedbackId)
		return expired
	}
	public clearFeedbackLatch(feedbackId: string): void {
		this.clearFeedbackLatchState(feedbackId)
		this.feedbackLatchConfig.delete(feedbackId)
	}
	public clearFeedbackLatches(): void {
		for (const timer of this.feedbackLatchTimers.values()) clearTimeout(timer)
		this.feedbackLatchTimers.clear()
		this.feedbackLatchUntil.clear()
		this.feedbackLatchConfig.clear()
		this.feedbackLatchExpired.clear()
	}
	private clearFeedbackLatchState(feedbackId: string): void {
		const timer = this.feedbackLatchTimers.get(feedbackId)
		if (timer) clearTimeout(timer)
		this.feedbackLatchTimers.delete(feedbackId)
		this.feedbackLatchUntil.delete(feedbackId)
		this.feedbackLatchExpired.delete(feedbackId)
	}

	public setStoredChannel(channel: number): void {
		this.storedChannel = channel
		this.notify()
	}

	public getStoredChannel(): number {
		return this.storedChannel
	}
}

export class X32Subscriptions {
	private readonly data: Map<string, Map<string, FeedbackId>>

	constructor() {
		this.data = new Map()
	}

	public getFeedbacks(path: string): FeedbackId[] {
		const entries = this.data.get(path)
		if (entries) {
			return Array.from(new Set(entries.values()))
		} else {
			return []
		}
	}
	public subscribe(path: string, feedbackId: string, type: FeedbackId): void {
		let entries = this.data.get(path)
		if (!entries) {
			entries = new Map()
			this.data.set(path, entries)
		}
		entries.set(feedbackId, type)
	}
	public unsubscribe(path: string, feedbackId: string): void {
		const entries = this.data.get(path)
		if (entries) {
			entries.delete(feedbackId)
		}
	}
}

interface IStoredChannelSubject {
	attach(observer: IStoredChannelObserver): void
	detach(observer: IStoredChannelObserver): void
	notify(): void
}

export interface IStoredChannelObserver {
	storedChannelChanged(): void
}
