# Outline the approved slogan so logo exports never depend on a visitor's installed fonts.
# The original TECHNICSAN wordmark and emblem remain traced from the supplied artwork.
Add-Type -AssemblyName System.Drawing
$brandRoot = Split-Path -Parent $PSScriptRoot
$brandCopy = Get-Content -LiteralPath (Join-Path $brandRoot 'src/data/brand.json') -Raw | ConvertFrom-Json
$brandPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
$brandFamily = [System.Drawing.FontFamily]::new('Arial')
$brandFormat = [System.Drawing.StringFormat]::GenericTypographic
try {
  $brandPath.AddString($brandCopy.slogan, $brandFamily, [int][System.Drawing.FontStyle]::Bold, 100, [System.Drawing.PointF]::new(0,0), $brandFormat)
  $brandBounds = $brandPath.GetBounds()
  $brandScale = 800 / $brandBounds.Width
  $brandMatrix = [System.Drawing.Drawing2D.Matrix]::new([single]$brandScale,0,0,[single]$brandScale,[single](-$brandBounds.X * $brandScale),[single](-$brandBounds.Y * $brandScale))
  $brandPath.Transform($brandMatrix)
  $brandPoints = $brandPath.PathPoints
  $brandTypes = $brandPath.PathTypes
  $brandCommands = [System.Text.StringBuilder]::new()
  function Format-BrandPoint($point) {
    $point.X.ToString('0.###', [System.Globalization.CultureInfo]::InvariantCulture) + ' ' + $point.Y.ToString('0.###', [System.Globalization.CultureInfo]::InvariantCulture)
  }
  for ($brandIndex=0; $brandIndex -lt $brandPoints.Length; $brandIndex++) {
    $brandType = $brandTypes[$brandIndex] -band 7
    $brandClose = ($brandTypes[$brandIndex] -band 128) -ne 0
    if ($brandType -eq 0) { [void]$brandCommands.Append('M' + (Format-BrandPoint $brandPoints[$brandIndex])) }
    elseif ($brandType -eq 1) { [void]$brandCommands.Append('L' + (Format-BrandPoint $brandPoints[$brandIndex])) }
    elseif ($brandType -eq 3) {
      [void]$brandCommands.Append('C' + (Format-BrandPoint $brandPoints[$brandIndex]) + ' ' + (Format-BrandPoint $brandPoints[$brandIndex+1]) + ' ' + (Format-BrandPoint $brandPoints[$brandIndex+2]))
      $brandClose = ($brandTypes[$brandIndex+2] -band 128) -ne 0
      $brandIndex += 2
    }
    if ($brandClose) { [void]$brandCommands.Append('Z') }
  }
  $brandHeight = ($brandBounds.Height * $brandScale).ToString('0.###', [System.Globalization.CultureInfo]::InvariantCulture)
  $brandSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ' + $brandHeight + '" role="img" aria-label="' + $brandCopy.slogan + '"><path fill="#003b27" d="' + $brandCommands.ToString() + '"/></svg>'
  [System.IO.File]::WriteAllText((Join-Path $brandRoot 'public/brand/technicsan-slogan.svg'), $brandSvg + "`n", [System.Text.UTF8Encoding]::new($false))
  Write-Output ('Prepared outlined slogan: ' + $brandCopy.slogan)
} finally {
  $brandPath.Dispose()
  $brandFamily.Dispose()
  $brandMatrix.Dispose()
}
