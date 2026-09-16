import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ActionsProps } from './main.js'
import { actionSubscriptionWrapper } from './util.js'
import {
	convertChoices,
	GetHeadampChoices,
	GetLevelsChoiceConfigs,
	HeadampGainChoice,
	HeadampGainDeltaChoice,
	InputTrimDeltaChoice,
} from '../choices.js'
import { parseHeadampRef, parseRefToPaths } from '../paths.js'
import { floatToHeadampGain, floatToTrim, headampGainToFloat, trimToFloat } from '../util.js'

export type HeadAmpActionsSchema = {
	input_trim: {
		options: {
			input: string
			trim: number
		}
	}
	input_trim_delta: {
		options: {
			input: string
			delta: number
		}
	}
	headamp_gain: {
		options: {
			headamp: string
			gain: number
		}
	}
	headamp_gain_delta: {
		options: {
			headamp: string
			delta: number
		}
	}
}

export function getHeadAmpActions(props: ActionsProps): CompanionActionDefinitions<HeadAmpActionsSchema> {
	const levelsChoices = GetLevelsChoiceConfigs(props.state)

	return {
		input_trim: {
			name: 'Set input trim',
			options: [
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					...convertChoices(levelsChoices.allSources),
					allowInvalidValues: true,
				},
				{
					type: 'number',
					label: 'Trim',
					id: 'trim',
					range: true,
					default: 0,
					step: 0.1,
					min: -18,
					max: 18,
				},
			],
			callback: async (action): Promise<void> => {
				const inputRef = parseRefToPaths(action.options.input, levelsChoices.allSourcesParseOptions)
				if (!inputRef?.trim) return

				props.sendOsc(inputRef.trim.path, {
					type: 'f',
					value: trimToFloat(action.options.trim),
				})
			},
		},
		input_trim_delta: {
			name: 'Adjust input trim',
			options: [
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					...convertChoices(levelsChoices.allSources),
					allowInvalidValues: true,
				},
				InputTrimDeltaChoice,
			],
			...actionSubscriptionWrapper(props, {
				getPath: (options) => {
					const inputRef = parseRefToPaths(options.input, levelsChoices.allSourcesParseOptions)
					return inputRef?.trim?.path ?? null
				},
				execute: (action, cachedData) => {
					const currentValue = cachedData?.[0]?.type === 'f' ? cachedData[0].value : undefined
					if (currentValue === undefined) return undefined

					return {
						type: 'f',
						value: trimToFloat(floatToTrim(currentValue) + action.options.delta),
					}
				},
				shouldSubscribe: true,
				optionsToMonitorForSubscribe: ['input'],
			}),
		},
		headamp_gain: {
			name: 'Set Headamp gain',
			options: [
				{
					type: 'dropdown',
					label: 'Headamp',
					id: 'headamp',
					...convertChoices(GetHeadampChoices()),
					expressionDescription: `eg 'local1', 'aes-a1', 'aes-b1'`,
				},
				HeadampGainChoice,
			],
			callback: async (action): Promise<void> => {
				const refPath = parseHeadampRef(action.options.headamp)
				if (!refPath) return

				props.sendOsc(`${refPath}/gain`, {
					type: 'f',
					value: headampGainToFloat(action.options.gain),
				})
			},
		},
		headamp_gain_delta: {
			name: 'Adjust Headamp gain',
			options: [
				{
					type: 'dropdown',
					label: 'Headamp',
					id: 'headamp',
					...convertChoices(GetHeadampChoices()),
					expressionDescription: `eg 'local1', 'aes-a1', 'aes-b1'`,
				},
				HeadampGainDeltaChoice,
			],
			...actionSubscriptionWrapper(props, {
				getPath: (options) => {
					const refPath = parseHeadampRef(options.headamp)
					return refPath ? `${refPath}/gain` : null
				},
				execute: (action, cachedData) => {
					const currentValue = cachedData?.[0]?.type === 'f' ? cachedData[0].value : undefined
					if (currentValue === undefined) return undefined

					return {
						type: 'f',
						value: headampGainToFloat(floatToHeadampGain(currentValue) + action.options.delta),
					}
				},
				shouldSubscribe: true,
				optionsToMonitorForSubscribe: ['headamp'],
			}),
		},
	}
}
