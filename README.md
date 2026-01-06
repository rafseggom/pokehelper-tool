# Type Coverage Calculator

<div align="center">
  <img src="./public/logo.png" alt="Type Coverage Logo" width="120" />
  <p><strong>Analizador de coberturas ofensivas y defensivas para Pokémon (Gen 9)</strong></p>
</div>

## Descripción del Proyecto
Type Coverage es una herramienta diseñada para jugadores que buscan optimizar la composición de sus equipos Pokémon. La aplicación permite visualizar de forma dinámica las debilidades defensivas y la capacidad de respuesta ofensiva de los movimientos de tu equipo.

El motor de cálculo está actualizado a la **Novena Generación**, integrando las tablas de tipos vigentes, el cálculo de daño por STAB (Same Type Attack Bonus) y las inmunidades específicas.

## Características Principales
* **Análisis Defensivo Dinámico**: Calcula el impacto de cada tipo atacante sobre los integrantes de tu equipo.
* **Cobertura Ofensiva**: Evalúa la eficacia de tus movimientos contra cada tipo, determinando el mejor multiplicador de daño disponible en tu set de ataques.
* **Gestión de STAB**: El sistema detecta automáticamente si un movimiento coincide con los tipos del Pokémon, aplicando el multiplicador de 1.5x (STAB) correspondiente.
* **Soporte para Tipos Duales**: Permite la configuración de Pokémon con uno o dos tipos para calcular correctamente las debilidades y resistencias.
* **Persistencia de Datos**: Utiliza `localStorage` para asegurar que la configuración de tu equipo se mantenga tras recargar la página.

## Iconografía de Tipos
La aplicación utiliza la iconografía original para los tipos Pokémon:

<div align="center">
  <table>
    <tr>
      <td><img src="./public/icons/normal.svg" width="25" /> <br/> Normal</td>
      <td><img src="./public/icons/fire.svg" width="25" /> <br/> Fire</td>
      <td><img src="./public/icons/water.svg" width="25" /> <br/> Water</td>
      <td><img src="./public/icons/grass.svg" width="25" /> <br/> Grass</td>
      <td><img src="./public/icons/electric.svg" width="25" /> <br/> Electric</td>
      <td><img src="./public/icons/ice.svg" width="25" /> <br/> Ice</td>
    </tr>
    <tr>
      <td><img src="./public/icons/fighting.svg" width="25" /> <br/> Fighting</td>
      <td><img src="./public/icons/poison.svg" width="25" /> <br/> Poison</td>
      <td><img src="./public/icons/ground.svg" width="25" /> <br/> Ground</td>
      <td><img src="./public/icons/flying.svg" width="25" /> <br/> Flying</td>
      <td><img src="./public/icons/psychic.svg" width="25" /> <br/> Psychic</td>
      <td><img src="./public/icons/bug.svg" width="25" /> <br/> Bug</td>
    </tr>
    <tr>
      <td><img src="./public/icons/rock.svg" width="25" /> <br/> Rock</td>
      <td><img src="./public/icons/ghost.svg" width="25" /> <br/> Ghost</td>
      <td><img src="./public/icons/dragon.svg" width="25" /> <br/> Dragon</td>
      <td><img src="./public/icons/dark.svg" width="25" /> <br/> Dark</td>
      <td><img src="./public/icons/steel.svg" width="25" /> <br/> Steel</td>
      <td><img src="./public/icons/fairy.svg" width="25" /> <br/> Fairy</td>
    </tr>
  </table>
</div>
