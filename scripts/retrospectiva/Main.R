require("data.table")

root <- "U:/DEPTO/DTVM RISCO/CONTROLES/SONS"
pathLogs <- file.path(root, "MISC.SOUNDS/logs")
pathDadosSons <- file.path(root, "noisy-risk.github.io/scripts/retrospectiva/DadosSons.csv")

files <- list.files(pathLogs, full.names = TRUE)

data <- rbindlist(lapply(files, function(x) {
  dt0 <- fread(x, sep = "|", encoding = "UTF-8")
  names(dt0) <- c("time", "ip", "nomeSom")
  dt0
}))
soundMetaData <- fread(pathDadosSons, sep=";", encoding="UTF-8")

ip2id = c(
  "192.168.36.195" = "AT",
  "192.168.37.138" = "CR7",
  "192.168.37.141" = "CR7",
  "192.168.37.15"  = "CT",
  "192.168.37.151" = "CT",
  "192.168.36.205" = "CT",
  "192.168.36.248" = "ED",
  "192.168.39.23"  = "GB",
  "192.168.36.202" = "IR",
  "192.168.37.60"  = "JP",
  "192.168.36.198" = "LG",
  "192.168.36.197" = "LG",
  "192.168.37.11"  = "LS",
  "192.168.36.206" = "LY",
  "192.168.36.254" = "RR",
  "192.168.37.117" = "RS",
  "192.168.37.95"  = "TG",
  "192.168.36.243" = "YR"
)

data[, uid := sapply(ip, function(x) ip2id[x])]
data[, dataRef := substr(time, 1, 10)]
data[, nomeSom := trimws(nomeSom)]
soundMetaData[, nomeSom := trimws(nomeSom)]

data <- merge(data, soundMetaData, by = "nomeSom", all.x = TRUE)

GerarRetrospectiva <- function(user) {
  dt0 <- data[uid == user]

  maisTocada <- dt0[, .N, nomeSom][order(-N)][1, nomeSom]
  top5 <- dt0[, .N, nomeSom][order(-N)][1:5]
  totalPlays <- dt0[, .N]
  tempoTotal <- dt0[, floor(sum(duracao, na.rm = TRUE) / 60)]
  diaMaisTocado <- dt0[, .N, dataRef][order(-N)][1, dataRef]
  tempoNoDiaMaisTocado <- dt0[dataRef == diaMaisTocado, floor(sum(duracao, na.rm = TRUE) / 60)]
  vezesNoDiaMaisTocado <- dt0[dataRef == diaMaisTocado, .N]
  somNoDiaMaisTocado <- dt0[dataRef == diaMaisTocado, .N, nomeSom][order(-N)][1, nomeSom]
  categoriaFavorita <- dt0[, .N, categoria][order(-N)][1, categoria]

  result <- list(
    maisTocada = maisTocada,
    top5 = top5,
    totalPlays = totalPlays,#
    tempoTotal = tempoTotal,
    diaMaisTocado = diaMaisTocado,
    tempoNoDiaMaisTocado = tempoNoDiaMaisTocado,
    vezesNoDiaMaisTocado = vezesNoDiaMaisTocado,
    somNoDiaMaisTocado = somNoDiaMaisTocado,
    categoriaFavorita = categoriaFavorita
  )
  
  cat(sprintf("Olá, %s \n", sigla))
  cat(sprintf("Nesse ano, você tocou %s sons! Parabéns\n", result[["totalPlays"]]))
  cat(sprintf("Você sabia que isso dá um total de %s minutos?\n", result[["tempoTotal"]]))
  cat(sprintf("O dia que você esteve mais inspirado foi %s\n", result[["diaMaisTocado"]]))
  cat(sprintf("Nesse dia, você clicou em %s sons! Foram %s minutos em um dia, e seu som favorito foi %s\n", result[["vezesNoDiaMaisTocado"]], result[["tempoNoDiaMaisTocado"]], result[["somNoDiaMaisTocado"]]))
  cat(sprintf("Sua categoria favorita foi: %s\n", result[["categoriaFavorita"]]))
  cat(sprintf("E por fim, seu som favorito em 2022 foi: %s\n", result[["maisTocada"]]))
  cat(sprintf("Aqui estão seus 5 sons mais tocados ao longo do ano\n"))
  print(result[["top5"]])
  return (result)
}

sigla <- "TG"
result <- GerarRetrospectiva(sigla)

