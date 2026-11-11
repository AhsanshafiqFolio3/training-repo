import { useId } from 'react'
import type { ReactElement } from 'react'
import type { Product } from './types'

interface ProductVisualProps {
  product: Pick<Product, 'kind' | 'color'>
  className?: string
}
export function ProductVisual({ product, className = '' }: ProductVisualProps): ReactElement {
  const uid = useId().replace(/:/g, '')
  const body = `${uid}-body`,
    dark = `${uid}-dark`,
    shadow = `${uid}-shadow`
  const fill = `url(#${body})`,
    shade = `url(#${dark})`
  let shape: ReactElement
  switch (product.kind) {
    case 'headphones':
      shape = (
        <g transform="translate(8 -8) rotate(-14 150 130)">
          <path
            d="M85 143V104C85 20 217 20 217 104v39"
            fill="none"
            stroke="#222823"
            strokeWidth="23"
          />
          <path d="M85 126v-23c0-76 132-76 132 0v23" fill="none" stroke={fill} strokeWidth="17" />
          <path d="M87 118v52m128-52v52" stroke="#9eaaa0" strokeWidth="10" />
          <rect
            x="67"
            y="126"
            width="46"
            height="82"
            rx="21"
            fill={shade}
            transform="rotate(-9 90 166)"
          />
          <rect
            x="69"
            y="128"
            width="31"
            height="77"
            rx="15"
            fill={fill}
            transform="rotate(-9 90 166)"
          />
          <rect
            x="193"
            y="126"
            width="46"
            height="82"
            rx="21"
            fill={shade}
            transform="rotate(9 215 166)"
          />
          <rect
            x="205"
            y="128"
            width="31"
            height="77"
            rx="15"
            fill={fill}
            transform="rotate(9 215 166)"
          />
          <path d="M223 151v16" stroke="#c4c9be" strokeWidth="2" strokeLinecap="round" />
        </g>
      )
      break
    case 'speaker':
      shape = (
        <g transform="rotate(-8 150 130)">
          <rect x="79" y="47" width="144" height="162" rx="53" fill={shade} />
          <rect x="72" y="45" width="142" height="162" rx="53" fill={fill} />
          {Array.from({ length: 17 }, (_, i) => (
            <path
              key={i}
              d={`M${86 + i * 7} 83v88`}
              stroke="#332c25"
              strokeWidth="2"
              opacity=".18"
            />
          ))}
          {Array.from({ length: 15 }, (_, i) => (
            <path
              key={i}
              d={`M89 ${79 + i * 6}h108`}
              stroke="#efe4d0"
              strokeWidth="1"
              opacity=".16"
            />
          ))}
          <rect x="117" y="44" width="51" height="9" rx="4" fill="#463f33" opacity=".5" />
          <circle cx="131" cy="48" r="1.5" fill="#e8dfd4" />
          <path d="M145 48h8" stroke="#e8dfd4" />
          <text x="143" y="187" textAnchor="middle" fontSize="10" fill="#f6ede0" letterSpacing="3">
            form
          </text>
        </g>
      )
      break
    case 'keyboard':
      shape = (
        <g transform="translate(0 6) rotate(-15 150 130)">
          <rect x="24" y="77" width="254" height="115" rx="12" fill="#777b74" />
          <rect x="22" y="70" width="254" height="115" rx="12" fill={fill} />
          {Array.from({ length: 5 }, (_row, row) =>
            Array.from({ length: row === 4 ? 8 : 13 }, (_key, col) => (
              <rect
                key={`${row}-${col}`}
                x={32 + col * 18}
                y={81 + row * 18}
                width={row === 4 && col === 3 ? 72 : 15}
                height="14"
                rx="3"
                fill={
                  col === 12 || (row === 0 && col === 0)
                    ? '#dc734c'
                    : row === 4 && col > 3
                      ? '#c1c0b4'
                      : '#f9f7f0'
                }
                stroke="#a0a292"
                strokeWidth=".5"
              />
            )),
          )}
          <circle cx="263" cy="90" r="5" fill="#4d554a" />
        </g>
      )
      break
    case 'mouse':
      shape = (
        <g transform="translate(10 -5) rotate(-23 150 130)">
          <path
            d="M103 187c-10-16-16-71-6-103 14-44 77-44 94 0 11 31 6 89-7 105-15 21-64 22-81-2"
            fill={shade}
          />
          <path
            d="M97 180c-9-20-11-68 0-100 14-43 71-43 88 0 12 31 9 78-3 99-14 23-72 23-85 1"
            fill={fill}
          />
          <path
            d="M141 53v69m-43 2c29-7 60-7 88 0"
            fill="none"
            stroke="#595d53"
            strokeWidth="1"
            opacity=".5"
          />
          <rect x="136" y="72" width="11" height="31" rx="5" fill="#444a40" />
          <path d="M139 80h5m-5 5h5m-5 5h5" stroke="#abae9e" />
          <text x="143" y="169" textAnchor="middle" fontSize="9" fill="#525a4b" letterSpacing="2">
            form
          </text>
        </g>
      )
      break
    case 'watch':
      shape = (
        <g transform="translate(0 -6) rotate(21 150 130)">
          <rect x="121" y="12" width="58" height="235" rx="22" fill={shade} />
          <rect x="125" y="14" width="50" height="232" rx="20" fill={fill} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x="147" y={195 + i * 8} width="5" height="3" rx="1.5" fill="#6b6e5c" />
          ))}
          <rect x="107" y="74" width="87" height="109" rx="25" fill="#969d92" />
          <rect x="104" y="70" width="87" height="109" rx="25" fill="#d5d8cd" />
          <rect x="111" y="77" width="73" height="95" rx="20" fill="#222b27" />
          <rect x="193" y="100" width="5" height="17" rx="2" fill="#717b70" />
          <circle cx="147" cy="124" r="28" fill="none" stroke="#95a67d" strokeWidth="3" />
          <path
            d="M148 102v23l14 9"
            stroke="#f4f1da"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <text x="147" y="157" textAnchor="middle" fill="#cfdaac" fontSize="8">
            WED 11
          </text>
        </g>
      )
      break
    case 'earbuds':
      shape = (
        <g transform="rotate(-12 150 130)">
          <rect x="66" y="99" width="169" height="111" rx="43" fill={shade} />
          <rect x="62" y="94" width="168" height="111" rx="43" fill={fill} />
          <path d="M65 128h161" stroke="#8f9385" strokeWidth="1" opacity=".55" />
          <circle cx="146" cy="151" r="2" fill="#6f8c5e" />
          <text x="147" y="179" textAnchor="middle" fontSize="12" fill="#676d60" letterSpacing="3">
            form
          </text>
          <g transform="translate(88 34) rotate(-20)">
            <rect x="0" y="0" width="29" height="43" rx="14" fill={fill} />
            <rect x="15" y="20" width="13" height="51" rx="6" fill={fill} />
            <ellipse cx="11" cy="15" rx="5" ry="8" fill="#4e574c" />
          </g>
          <g transform="translate(189 31) rotate(24)">
            <rect x="0" y="0" width="29" height="43" rx="14" fill={fill} />
            <rect x="1" y="20" width="13" height="51" rx="6" fill={fill} />
            <ellipse cx="20" cy="15" rx="5" ry="8" fill="#4e574c" />
          </g>
        </g>
      )
      break
    case 'lamp':
      shape = (
        <g>
          <ellipse cx="155" cy="209" rx="65" ry="13" fill={shade} />
          <ellipse cx="151" cy="204" rx="65" ry="13" fill={fill} />
          <path d="M153 200v-98l35-38" stroke={shade} strokeWidth="9" fill="none" />
          <path d="M150 200v-98l35-38" stroke={fill} strokeWidth="7" fill="none" />
          <path d="M124 65c6-43 87-43 95 0l5 16H119z" fill={fill} />
          <ellipse cx="172" cy="80" rx="53" ry="11" fill="#f6e6b5" />
          <ellipse cx="172" cy="80" rx="31" ry="5" fill="#fff2cd" />
        </g>
      )
      break
    case 'charger':
      shape = (
        <g transform="rotate(-19 150 130)">
          <path d="M124 54V28m37 26V28" stroke="#9c9f95" strokeWidth="10" />
          <rect x="92" y="52" width="115" height="138" rx="23" fill={shade} />
          <rect x="85" y="49" width="111" height="137" rx="23" fill={fill} />
          <rect x="110" y="64" width="57" height="24" rx="8" fill="#545b50" />
          <rect x="119" y="72" width="19" height="7" rx="3" fill="#222a23" />
          <rect x="145" y="72" width="13" height="7" rx="2" fill="#222a23" />
          <text x="140" y="150" textAnchor="middle" fill="#636e5b" fontSize="14" letterSpacing="3">
            form
          </text>
          <text x="140" y="167" textAnchor="middle" fill="#636e5b" fontSize="8">
            65W · GaN
          </text>
        </g>
      )
      break
    case 'stand':
      shape = (
        <g transform="rotate(-12 150 130)">
          <path d="M111 179l34-75h25l28 77" fill="none" stroke={shade} strokeWidth="14" />
          <path d="M73 181h160l-13 20H61z" fill={fill} />
          <path d="M69 82l162-18-7 66L62 146z" fill={shade} />
          <path d="M61 72l162-18-7 66L54 136z" fill={fill} />
          <path d="M60 125l156-16" stroke="#e9ebe5" strokeWidth="3" />
          <rect
            x="118"
            y="79"
            width="45"
            height="11"
            rx="5"
            transform="rotate(-7 140 85)"
            fill="#91998d"
          />
        </g>
      )
      break
    default:
      shape = (
        <g transform="rotate(-10 150 130)">
          <path d="M124 166h54l14 39H105z" fill={shade} />
          <rect x="61" y="77" width="181" height="93" rx="28" fill={shade} />
          <rect x="57" y="70" width="181" height="93" rx="28" fill={fill} />
          <circle cx="148" cy="116" r="36" fill="#242c27" />
          <circle cx="148" cy="116" r="26" fill="#52635d" />
          <circle cx="148" cy="116" r="17" fill="#182a2b" />
          <circle cx="142" cy="110" r="7" fill="#8da5a0" opacity=".6" />
          <circle cx="211" cy="116" r="3" fill="#a7c28f" />
          <path d="M72 98v37m6-37v37m6-37v37" stroke="#354134" opacity=".5" strokeWidth="2" />
        </g>
      )
  }
  return (
    <svg className={`product-visual ${className}`} viewBox="0 0 300 260" aria-hidden="true">
      <defs>
        <linearGradient id={body} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={product.color} />
          <stop offset=".45" stopColor={product.color} />
          <stop offset="1" stopColor="#101c12" stopOpacity=".46" />
        </linearGradient>
        <linearGradient id={dark} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={product.color} />
          <stop offset="1" stopColor="#242a22" />
        </linearGradient>
        <filter id={shadow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <ellipse
        cx="154"
        cy="226"
        rx="71"
        ry="7"
        fill="#363a2a"
        opacity=".16"
        filter={`url(#${shadow})`}
      />
      {shape}
    </svg>
  )
}
