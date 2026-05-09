package edu.cit.villas.ugnay.features.discovery;

import java.util.List;

import org.springframework.stereotype.Service;

import edu.cit.villas.ugnay.shared.entity.Manufacturer;
import edu.cit.villas.ugnay.shared.entity.User;
import edu.cit.villas.ugnay.shared.repository.ManufacturerRepository;

@Service
public class ManufacturerService {

    private final ManufacturerRepository manufacturerRepository;

    public ManufacturerService(ManufacturerRepository manufacturerRepository) {
        this.manufacturerRepository = manufacturerRepository;
    }

    public List<Manufacturer> getAllManufacturers() {
        return manufacturerRepository.findAll();
    }

    public Manufacturer getManufacturerById(Long id) {
        return manufacturerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Manufacturer not found"));
    }

    public Manufacturer getManufacturerByUser(User user) {
        return manufacturerRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Manufacturer profile not found for user"));
    }
}
