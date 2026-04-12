package edu.cit.villas.ugnay.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.villas.ugnay.entity.Connection;
import edu.cit.villas.ugnay.entity.Manufacturer;
import edu.cit.villas.ugnay.entity.Vendor;
import edu.cit.villas.ugnay.repository.ConnectionRepository;

@Service
public class ConnectionService {

    private final ConnectionRepository connectionRepository;

    public ConnectionService(ConnectionRepository connectionRepository) {
        this.connectionRepository = connectionRepository;
    }

    @Transactional
    public Connection saveConnection(Vendor vendor, Manufacturer manufacturer) {
        if (connectionRepository.existsByVendorAndManufacturer(vendor, manufacturer)) {
            throw new IllegalArgumentException("Already connected to this manufacturer");
        }
        Connection connection = new Connection();
        connection.setVendor(vendor);
        connection.setManufacturer(manufacturer);
        return connectionRepository.save(connection);
    }

    public List<Connection> getConnectionsByVendor(Vendor vendor) {
        return connectionRepository.findByVendor(vendor);
    }

    public List<Connection> getConnectionsByManufacturer(Manufacturer manufacturer) {
        return connectionRepository.findByManufacturer(manufacturer);
    }

    @Transactional
    public void removeConnection(Long connectionId, Vendor vendor) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new IllegalArgumentException("Connection not found"));

        if (!connection.getVendor().getVendorId().equals(vendor.getVendorId())) {
            throw new IllegalArgumentException("You can only remove your own connections");
        }

        connectionRepository.delete(connection);
    }
}
