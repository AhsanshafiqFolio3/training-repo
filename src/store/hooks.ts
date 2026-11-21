import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

// Typed versions of the react-redux hooks. Use these instead of the plain ones,
// so selectors and dispatch know the shape of our state and actions.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
