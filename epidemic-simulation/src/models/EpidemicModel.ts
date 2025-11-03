abstract class EpidemicModel {
    compartments: Map<string, number>[] = [];
    updateState() {} // SIRS, SIS, SIVD
}