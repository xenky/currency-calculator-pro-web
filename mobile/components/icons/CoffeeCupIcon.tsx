import React from 'react';

// Define las props que aceptará tu componente
interface CoffeeCupIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string; // Permite definir el tamaño (ej: 24, "1.5em", "100%")
  color?: string;       // Permite definir el color de relleno
  className?: string;   // Permite pasar clases de Tailwind u otras
}

const CoffeeCupIcon: React.FC<CoffeeCupIconProps> = ({
  size = 24, // Tamaño por defecto de 24px
  color = '#32190f', // Color por defecto (el que tenías en el SVG)
  className,
  ...rest // Captura cualquier otra prop de SVG como onClick, style, etc.
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8.4666657 9.2774384"
      version="1.1"
      id="svg1"
      xmlSpace="preserve" // xml:space se convierte en xmlSpace
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink" // Añadido por si se usan xlink:href
      className={className} // Aquí se aplican las clases de Tailwind
      fill={color} // El color de relleno se controla con la prop 'color'
      {...rest} // Pasa el resto de las props al elemento SVG
    >
      <defs id="defs1">
        <clipPath clipPathUnits="userSpaceOnUse" id="clipPath2">
          <path d="M 0,3000 H 3000 V 0 H 0 Z" transform="translate(-2348.8408,-1441.2637)" id="path2-2" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id="clipPath4">
          <path d="M 0,3000 H 3000 V 0 H 0 Z" transform="translate(-2344.545,-1434.2481)" id="path4-9" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id="clipPath6">
          <path d="M 0,3000 H 3000 V 0 H 0 Z" transform="translate(-2669.2354,-418.57809)" id="path6-1" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id="clipPath8">
          <path d="M 0,3000 H 3000 V 0 H 0 Z" transform="translate(-245.8486,-418.57809)" id="path8" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id="clipPath10">
          <path d="M 0,3000 H 3000 V 0 H 0 Z" transform="translate(-2014.6114,-562.62894)" id="path10" />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id="clipPath12">
          <path d="M 0,3000 H 3000 V 0 H 0 Z" transform="translate(-2723.1417,-1357.0323)" id="path12" />
        </clipPath>
      </defs>
      <g id="layer-MC0" transform="matrix(0.26458333,0,0,0.26458334,128.21384,-208.8439)">
        <g id="g37" style={{ fill: color, fillOpacity: 1 }} transform="matrix(0.49999497,0,0,0.49999497,-233.95619,402.88618)">
          <g id="g36" style={{ fill: color, fillOpacity: 1 }}>
            <g id="g35" style={{ fill: color, fillOpacity: 1 }}>
              <g id="g34" style={{ fill: color, fillOpacity: 1 }}>
                <g id="g32" transform="matrix(0.07636653,0,0,0.07636653,-475.29041,797.58529)" style={{ fill: color, fillOpacity: 1 }}>
                  <path d="m 58.317076,-323.27405 c 57.071684,53.32016 54.783564,145.96983 5.735373,203.40029 C 20.388791,-67.842393 20.43033,-0.17626449 52.290397,55.343637 23.692643,31.111243 12.106803,-0.3268124 8.1663638,-33.399199 c 0.00476,0.25982 -0.024342,-0.497946 -0.023019,-0.472282 C 3.6290243,-135.7612 65.677519,-125.33159 78.511663,-223.74838 c -0.03466,0.6514 -0.0048,0.10953 -0.01032,0.22304 2.249752,-32.12412 -1.616869,-63.68441 -20.184267,-99.74871 Z" id="path30" style={{ fill: color, fillOpacity: 1, strokeWidth: 0.264583 }} />
                  <path d="m 84.905319,-83.270247 c -5.967412,21.143383 -5.915819,31.37826 -3.411802,47.185791 -0.0418,-0.61251 -0.0042,-0.133879 -0.01032,-0.254529 7.29324,35.45972261 27.997413,33.9248747 32.186033,74.465391 1.79044,26.124958 -10.63598,47.806768 -26.282385,57.631276 6.219825,-22.803379 5.449623,-32.632914 3.452019,-47.001641 0,0.141817 -0.01429,-0.406135 0,0.30189 C 85.506717,24.160375 75.186909,16.022056 69.279557,6.3131708 49.166726,-26.443039 58.97139,-67.152889 84.905584,-83.270247 Z" id="path31" style={{ fill: color, fillOpacity: 1, strokeWidth: 0.264583 }} />
                  <path d="m 160.77062,-144.9552 c -5.0964,20.25464 -6.74079,32.94221 -2.70351,53.19421 -0.0482,-0.401373 -0.005,-0.07461 -0.0114,-0.147638 2.11296,8.859573 5.55493,18.44966 10.97862,25.72676 -0.027,-0.0336 0.0947,0.120915 -0.0545,-0.0672 34.59877,42.171937 16.98704,85.411468 -6.08198,99.96752 5.59276,-20.946269 5.18769,-30.5120146 2.87576,-45.891714 0.0201,0.707495 -0.003,0.166687 0,0.31115 -6.6257,-26.591683 -16.49386,-31.071079 -23.4696,-43.723719 -16.33564,-29.612695 -8.64659,-71.395959 18.46712,-89.369369 z" id="path32" style={{ fill: color, fillOpacity: 1, strokeWidth: 0.264583 }} />
                </g>
                <g id="g33" transform="matrix(0.01788155,0,0,0.01788155,-505.03101,773.38255)" style={{ fill: color, fillOpacity: 1 }}>
                  <path id="path1-9" d="m 0,0 c 67.885,32.467 106.183,69.251 106.183,108.227 0,131.398 -435.257,237.915 -972.171,237.915 -536.913,0 -972.168,-106.517 -972.168,-237.915 0,-131.396 435.255,-237.914 972.168,-237.914 155.834,0 303.097,8.974 433.647,24.924 -123.449,-12.025 -265.274,-18.869 -416.135,-18.869 -477.402,0 -864.412,68.51 -864.412,153.02 0,84.51 387.01,153.02 864.412,153.02 477.402,0 864.414,-68.51 864.414,-153.02 C 15.938,19.336 10.452,9.511 0,0" style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }} transform="matrix(1.3333333,0,0,-1.3333333,3131.7877,2078.3151)" clipPath="url(#clipPath2)" />
                  <path id="path3-3" d="m 0,0 c 12.991,-417.802 -395.394,-988.982 -864.979,-988.982 -469.522,0 -989.25,555.351 -989.388,1034.549 -0.3,-8.299 -0.464,-16.668 -0.464,-25.121 0,-496.135 519.748,-1070.618 1009.087,-1070.618 587.837,0 951.618,648.856 951.618,1144.993 0,0 -74.39,26.228 -76.585,-49.233 C 27.979,0.57 -0.622,19.985 0,0" style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }} transform="matrix(1.3333333,0,0,-1.3333333,3126.0599,2087.6693)" clipPath="url(#clipPath4)" />
                  <path id="path5-6" d="m 0,0 c -11.897,-186.323 -538.951,-338.164 -1205.129,-339.153 2.371,-0.003 4.737,-0.012 7.112,-0.012 725.092,0 1312.896,151.849 1312.896,339.165 C 114.879,95.628 3.22,50.422 0,0" style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: '#751617', strokeWidth: 1, strokeLinecap: 'butt', strokeLinejoin: 'miter', strokeMiterlimit: 10, strokeDasharray: 'none', strokeOpacity: 1 }} transform="matrix(1.3333333,0,0,-1.3333333,3558.9805,3441.8959)" clipPath="url(#clipPath6)" />
                  <path id="path7" d="M 0,0 C 25.617,98.606 198.472,275.508 559.348,303.607 141.778,271.093 -87.526,105.503 -87.526,0 c 0,-171.772 736.272,-300.508 1135.477,-336.088 C 458.112,-283.518 -43.191,-166.253 0,0" style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: '#751617', strokeWidth: 1, strokeLinecap: 'butt', strokeLinejoin: 'miter', strokeMiterlimit: 10, strokeDasharray: 'none', strokeOpacity: 1 }} transform="matrix(1.3333333,0,0,-1.3333333,327.79813,3441.8959)" clipPath="url(#clipPath8)" />
                  <path id="path9" d="m 0,0 c -1.456,0.261 151.003,-54.289 109.499,-126.73 -45.182,-78.862 -299.114,-158.891 -645.268,-158.891 -346.152,0 -603.651,76.666 -626.764,164.566 -9.956,37.862 30.021,87.242 143.215,112.852 -102.281,-23.14 -215.022,-71.963 -215.022,-149.34 0,-111.04 316.894,-201.056 707.802,-201.056 390.91,0 653.763,104.054 707.805,201.056 C 241.607,-49.233 41.026,-7.294 0,0" style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: '#751617', strokeWidth: 1, strokeLinecap: 'butt', strokeLinejoin: 'miter', strokeMiterlimit: 10, strokeDasharray: 'none', strokeOpacity: 1 }} transform="matrix(1.3333333,0,0,-1.3333333,2686.1484,3249.8281)" clipPath="url(#clipPath10)" />
                  <path id="path11" d="m 0,0 c -136.874,27.771 -363.213,-71.142 -400.658,-196.673 78.733,70.029 235.162,97.177 343.095,75.277 76.621,-15.545 141.956,-62.132 24.914,-334.149 -45.128,-104.882 -356.925,-45.392 -393.849,-166.42 -4.271,-14.001 -12.868,-63.033 -6.154,-41.026 36.924,121.027 389.748,-10.014 508.721,321.494 C 176.782,-60.872 76.62,-15.546 0,0" style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: '#751617', strokeWidth: 1, strokeLinecap: 'butt', strokeLinejoin: 'miter', strokeMiterlimit: 10, strokeDasharray: 'none', strokeOpacity: 1 }} transform="matrix(1.3333333,0,0,-1.3333333,3630.8555,2190.6237)" clipPath="url(#clipPath12)" />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

export default CoffeeCupIcon;
