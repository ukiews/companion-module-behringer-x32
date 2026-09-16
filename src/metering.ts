import osc from 'osc'

export const CHANNEL_METERS_ALIAS = '/x_companion_channel_meters'
export const CHANNEL_METERS_SOURCE = '/meters/0'
export const CHANNEL_METER_COUNT = 32

export function parseChannelMeterLevels(args: osc.MetaArgument[]): number[] | null {
	const blob = args[0]?.type === 'b' ? args[0].value : undefined
	if (!blob || blob.byteLength < CHANNEL_METER_COUNT * 4) return null

	const view = new DataView(blob.buffer, blob.byteOffset, blob.byteLength)
	const availableValuesWithHeader = Math.floor((blob.byteLength - 4) / 4)
	const declaredValueCount = blob.byteLength >= 4 ? view.getUint32(0, true) : 0
	const hasValueCountHeader =
		declaredValueCount >= CHANNEL_METER_COUNT && declaredValueCount <= availableValuesWithHeader
	const valuesOffset = hasValueCountHeader ? 4 : 0

	if (blob.byteLength < valuesOffset + CHANNEL_METER_COUNT * 4) return null

	const levels: number[] = []
	for (let index = 0; index < CHANNEL_METER_COUNT; index++) {
		const value = view.getFloat32(valuesOffset + index * 4, true)
		levels.push(Number.isFinite(value) ? Math.max(0, value) : 0)
	}

	return levels
}
